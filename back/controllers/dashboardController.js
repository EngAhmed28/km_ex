import pool from '../config/database.js';

// Get user dashboard data (different based on role)
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info with role
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const user = users[0];
    const dashboardData = {
      user,
      stats: {},
      permissions: null
    };

    // Get role-specific data
    if (user.role === 'admin') {
      // Admin dashboard stats
      const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const [productsCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
      const [ordersCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
      const [categoriesCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
      
      // Get recent orders (last 5)
      const [recentOrders] = await pool.execute(
        `SELECT o.id, o.total_amount, o.status, o.created_at, 
         COALESCE(u.name, o.guest_name) as customer_name,
         COALESCE(u.email, o.guest_email) as customer_email
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC
         LIMIT 5`
      );
      
      // Get recent users (last 5)
      const [recentUsers] = await pool.execute(
        `SELECT id, name, email, role, created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT 5`
      );
      
      // Get orders by status
      const [ordersByStatus] = await pool.execute(
        `SELECT status, COUNT(*) as count 
         FROM orders 
         GROUP BY status`
      );
      
      // Get total revenue
      const [revenueResult] = await pool.execute(
        `SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
         FROM orders 
         WHERE status != 'cancelled'`
      );
      
      dashboardData.stats = {
        totalUsers: usersCount[0]?.count || 0,
        totalProducts: productsCount[0]?.count || 0,
        totalOrders: ordersCount[0]?.count || 0,
        totalCategories: categoriesCount[0]?.count || 0,
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue || 0),
        recentOrders: recentOrders,
        recentUsers: recentUsers,
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {})
      };
    } else if (user.role === 'employee') {
      // Employee dashboard - get permissions (only those with can_view = true)
      const [permissions] = await pool.execute(
        'SELECT * FROM employee_permissions WHERE employee_id = ? AND can_view = 1',
        [userId]
      );
      
      // Convert MySQL TINYINT(1) to boolean for consistency
      // Handle both numeric (1/0) and boolean (true/false) values
      const formattedPermissions = permissions.map(perm => {
        const convertToBoolean = (value) => {
          if (value === true || value === 1 || value === '1' || value === 'true') return true;
          if (value === false || value === 0 || value === '0' || value === 'false') return false;
          return Boolean(value);
        };
        
        return {
          ...perm,
          can_view: convertToBoolean(perm.can_view),
          can_create: convertToBoolean(perm.can_create),
          can_edit: convertToBoolean(perm.can_edit),
          can_delete: convertToBoolean(perm.can_delete)
        };
      });
      
      console.log('Formatted permissions:', formattedPermissions);
      dashboardData.permissions = formattedPermissions;
      
      // Get stats based on permissions
      const stats = {};
      for (const perm of formattedPermissions) {
        if (perm.permission_type === 'users' && perm.can_view) {
          const [count] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
          stats.usersCount = count[0]?.count || 0;
        }
        if (perm.permission_type === 'products' && perm.can_view) {
          const [count] = await pool.execute('SELECT COUNT(*) as count FROM products');
          stats.productsCount = count[0]?.count || 0;
        }
        if (perm.permission_type === 'orders' && perm.can_view) {
          const [count] = await pool.execute('SELECT COUNT(*) as count FROM orders');
          stats.ordersCount = count[0]?.count || 0;
        }
        if (perm.permission_type === 'categories' && perm.can_view) {
          const [count] = await pool.execute('SELECT COUNT(*) as count FROM categories');
          stats.categoriesCount = count[0]?.count || 0;
        }
      }
      dashboardData.stats = stats;
    } else {
      // Customer dashboard
      let ordersCount = 0;
      let totalSpent = 0;
      let recentOrders = [];
      let ordersByStatus = {};
      let recommendedProducts = [];
      
      try {
        // Get orders count
        const [orders] = await pool.execute(
          'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
          [userId]
        );
        ordersCount = orders[0]?.count || 0;
        
        // Get total spent (only delivered orders)
        const [totals] = await pool.execute(
          'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status = "delivered"',
          [userId]
        );
        totalSpent = parseFloat(totals[0]?.total || 0);
        
        // Get recent orders (last 5)
        const [recentOrdersData] = await pool.execute(
          `SELECT id, total_amount, status, created_at, payment_method
           FROM orders 
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 5`,
          [userId]
        );
        // Convert total_amount to number
        recentOrders = recentOrdersData.map(order => ({
          ...order,
          total_amount: parseFloat(order.total_amount || 0)
        }));
        
        // Get orders by status
        const [ordersByStatusData] = await pool.execute(
          `SELECT status, COUNT(*) as count 
           FROM orders 
           WHERE user_id = ?
           GROUP BY status`,
          [userId]
        );
        ordersByStatus = ordersByStatusData.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {});
        
        // Get recommended products (best sellers or new arrivals - limit 6)
        const [products] = await pool.execute(
          `SELECT p.id, p.name, p.name_en, p.name_ar, p.price, p.old_price, 
                  p.image_url, p.rating, p.reviews_count, p.slug,
                  (SELECT pi.image_url FROM product_images pi 
                   WHERE pi.product_id = p.id AND pi.is_primary = 1 
                   LIMIT 1) as primary_image
           FROM products p
           WHERE p.is_active = 1
           ORDER BY p.rating DESC, p.reviews_count DESC, p.created_at DESC
           LIMIT 6`
        );
        
        // Use primary_image if available, otherwise use image_url
        recommendedProducts = products.map(product => ({
          ...product,
          image_url: product.primary_image || product.image_url
        }));
      } catch (err) {
        console.log('Error fetching customer dashboard data:', err);
      }
      
      dashboardData.stats = {
        ordersCount,
        totalSpent,
        memberSince: user.created_at,
        recentOrders,
        ordersByStatus,
        recommendedProducts
      };
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات الداشبورد'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لا توجد بيانات للتحديث'
      });
    }

    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user data
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الملف الشخصي'
    });
  }
};
