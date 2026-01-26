import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate random password for guest accounts
const generateRandomPassword = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create order (supports both logged-in users and guests)
// For guests, automatically creates a customer account
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      items, // Array of { product_id, quantity, price }
      total_amount,
      // Guest fields (if user is not logged in)
      guest_name,
      guest_email,
      phone,
      governorate,
      city,
      shipping_address,
      payment_method,
      notes
    } = req.body;
    
    // Get user_id from token if authenticated, otherwise null for guests
    let user_id = req.user ? (req.user.userId || req.user.id) : null;
    
    console.log('📝 Order creation - req.user:', req.user);
    console.log('📝 Order creation - user_id:', user_id);
    
    // Variables for account creation
    let accountCreated = false;
    let temporaryPassword = null;
    
    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'يجب إضافة منتجات على الأقل'
      });
    }
    
    if (!total_amount || total_amount <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'المبلغ الإجمالي غير صحيح'
      });
    }
    
    // For guests, require guest_name, phone, and email
    if (!user_id) {
      if (!guest_name || !phone || !guest_email) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'الاسم ورقم الهاتف والبريد الإلكتروني مطلوبان للزوار'
        });
      }
      
      // Check if user already exists with this email
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [guest_email]
      );
      
      if (existingUsers.length > 0) {
        // User exists, use their ID
        user_id = existingUsers[0].id;
        console.log(`✅ Found existing user with email ${guest_email}, using user_id: ${user_id}`);
      } else {
        // Create new customer account for guest
        const randomPassword = generateRandomPassword();
        temporaryPassword = randomPassword; // Save password to return to user
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
        
        console.log(`🆕 Creating new customer account for guest: ${guest_name} (${guest_email})`);
        
        const [userResult] = await connection.execute(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [guest_name, guest_email, hashedPassword, 'customer']
        );
        
        user_id = userResult.insertId;
        accountCreated = true;
        console.log(`✅ Created new customer account with user_id: ${user_id}`);
        
        // Note: In production, you should send the password via email
        // For development, we return it in the response
      }
    }
    
    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'بيانات المنتجات غير صحيحة'
        });
      }
      
      // Check if product exists and is active
      const [products] = await connection.execute(
        'SELECT id, stock, is_active FROM products WHERE id = ?',
        [item.product_id]
      );
      
      if (products.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `المنتج برقم ${item.product_id} غير موجود`
        });
      }
      
      if (products[0].is_active !== 1) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `المنتج برقم ${item.product_id} غير متاح حالياً`
        });
      }
      
      // Check stock availability
      if (products[0].stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `الكمية المتاحة للمنتج برقم ${item.product_id} غير كافية`
        });
      }
    }
    
    // Create order (now user_id is always set - either from token or newly created account)
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id, 
        guest_name, 
        guest_email, 
        phone, 
        governorate, 
        city, 
        shipping_address, 
        total_amount, 
        payment_method, 
        notes, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        user_id, // Always set now (either from token or newly created account)
        null, // guest_name is null since we have user_id
        null, // guest_email is null since we have user_id
        phone || null,
        governorate || null,
        city || null,
        shipping_address || null,
        total_amount,
        payment_method || null,
        notes || null
      ]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      // Update product stock
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    await connection.commit();
    
    // Fetch created order with items
    const [orders] = await connection.execute(
      `SELECT o.*, 
        GROUP_CONCAT(
          CONCAT(oi.product_id, ':', oi.quantity, ':', oi.price) 
          SEPARATOR ','
        ) as items_data
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id`,
      [orderId]
    );
    
    // Prepare response
    const responseData = {
      order: orders[0],
      order_id: orderId,
      user_id: user_id,
      account_created: accountCreated || false
    };
    
    // Include temporary password if account was created
    // Always include in development, or if NODE_ENV is not set (defaults to development)
    if (accountCreated && temporaryPassword) {
      responseData.temporary_password = temporaryPassword;
      if (!responseData.message) {
        responseData.message = 'تم إنشاء الطلب والحساب بنجاح. كلمة المرور المؤقتة: ' + temporaryPassword;
      }
    }
    
    // Log for debugging
    console.log('📦 Order created:', {
      order_id: orderId,
      user_id: user_id,
      account_created: accountCreated,
      has_temporary_password: !!temporaryPassword,
      node_env: process.env.NODE_ENV
    });
    
    res.status(201).json({
      success: true,
      message: responseData.message || 'تم إنشاء الطلب بنجاح',
      data: responseData
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الطلب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, include_stats } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email,
        COUNT(oi.id) as items_count,
        SUM(oi.quantity * oi.price) as calculated_total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filter by status
    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    // Search by order ID, user name, email, or phone
    if (search) {
      query += ' AND (o.id LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR o.phone LIKE ? OR o.guest_name LIKE ? OR o.guest_email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [orders] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' AND o.status = ?';
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ' AND (o.id LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR o.phone LIKE ? OR o.guest_name LIKE ? OR o.guest_email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    const responseData = {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
    
    // Include statistics if requested
    if (include_stats === 'true') {
      // Get status counts
      const [statusCounts] = await pool.execute(
        `SELECT status, COUNT(*) as count 
         FROM orders 
         GROUP BY status`
      );
      
      // Get total revenue
      const [revenueResult] = await pool.execute(
        `SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders
         FROM orders 
         WHERE status != 'cancelled'`
      );
      
      // Get orders by date (last 7 days)
      const [dailyOrders] = await pool.execute(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          COALESCE(SUM(total_amount), 0) as revenue
         FROM orders 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      );
      
      // Get payment method distribution
      const [paymentMethods] = await pool.execute(
        `SELECT 
          payment_method,
          COUNT(*) as count
         FROM orders 
         WHERE payment_method IS NOT NULL
         GROUP BY payment_method`
      );
      
      responseData.stats = {
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || 0),
        totalOrders: parseInt(revenueResult[0]?.total_orders || 0),
        dailyOrders: dailyOrders.map((item) => ({
          date: item.date,
          count: parseInt(item.count),
          revenue: parseFloat(item.revenue || 0)
        })),
        paymentMethods: paymentMethods.map((item) => ({
          method: item.payment_method,
          count: parseInt(item.count)
        }))
      };
    }
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلبات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user orders (for logged-in users)
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const [orders] = await pool.execute(
      `SELECT o.*, 
        COUNT(oi.id) as items_count,
        SUM(oi.quantity * oi.price) as calculated_total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [userId]
    );
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT oi.*, p.name as product_name, p.name_ar as product_name_ar, p.name_en as product_name_en
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );
        
        return {
          ...order,
          items: items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name_ar || item.product_name_en || item.product_name || 'Unknown',
            quantity: item.quantity,
            price: parseFloat(item.price || 0)
          }))
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        orders: ordersWithItems
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلبات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? (req.user.userId || req.user.id) : null;
    
    console.log(`🔍 Getting order #${id} - userId: ${userId}`);
    
    // Get user role from database if user is authenticated
    let userRole = null;
    if (userId) {
      const [users] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );
      if (users.length > 0) {
        userRole = users[0].role;
      }
    }
    
    console.log(`🔍 User role from DB: ${userRole}`);
    
    const [orders] = await pool.execute(
      `SELECT o.*, 
        u.name as user_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    const order = orders[0];
    console.log(`✅ Found order #${id} - user_id: ${order.user_id}`);
    
    // Check if user has access to this order
    // Admin can view all orders, employees can view all orders (if they have permission)
    // Regular users can only view their own orders
    if (userRole === 'admin' || userRole === 'employee') {
      // Admin and employees can view all orders
      console.log(`✅ Access granted - user is ${userRole}`);
    } else if (userId && order.user_id === userId) {
      // User can view their own orders
      console.log(`✅ Access granted - user owns this order`);
    } else {
      // No access
      console.log(`❌ Access denied - userRole: ${userRole}, userId: ${userId}, order.user_id: ${order.user_id}`);
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذا الطلب'
      });
    }
    
    // Get order items with product details
    const [items] = await pool.execute(
      `SELECT oi.*, 
        p.name_ar, p.name_en, p.name, p.image_url,
        p.slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id`,
      [id]
    );
    
    console.log(`📦 Order #${id} items:`, items);
    console.log(`📦 Order #${id} items count:`, items.length);
    
    res.json({
      success: true,
      data: {
        order: {
          ...order,
          items: items || []
        }
      }
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة الطلب غير صحيحة'
      });
    }
    
    const [result] = await pool.execute(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    // Fetch updated order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      data: {
        order: orders[0]
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الطلب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
