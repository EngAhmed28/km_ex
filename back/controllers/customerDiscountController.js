import pool from '../config/database.js';

// Get customer discount
export const getCustomerDiscount = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer exists and is actually a customer
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [customerId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    if (users[0].role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'المستخدم ليس عميلاً'
      });
    }
    
    // Get active discount
    const [discounts] = await pool.execute(
      `SELECT cd.*, 
       u.name as created_by_name
       FROM customer_discounts cd
       LEFT JOIN users u ON cd.created_by = u.id
       WHERE cd.customer_id = ? AND cd.is_active = 1
       ORDER BY cd.created_at DESC
       LIMIT 1`,
      [customerId]
    );
    
    // Convert MySQL TINYINT(1) to boolean
    const formattedDiscount = discounts.length > 0 ? {
      ...discounts[0],
      is_active: Boolean(discounts[0].is_active)
    } : null;
    
    res.json({
      success: true,
      data: {
        discount: formattedDiscount
      }
    });
  } catch (error) {
    console.error('Get customer discount error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب خصم العميل'
    });
  }
};

// Set customer discount
export const setCustomerDiscount = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { discount_percentage, start_date, end_date, is_active } = req.body;
    const adminId = req.user.userId;
    
    // Validate input
    if (!discount_percentage || discount_percentage < 0 || discount_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'نسبة الخصم يجب أن تكون بين 0 و 100'
      });
    }
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'يجب تحديد تاريخ البداية والنهاية'
      });
    }
    
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
      });
    }
    
    // Verify customer exists and is actually a customer
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [customerId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    if (users[0].role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'المستخدم ليس عميلاً'
      });
    }
    
    // Deactivate all existing discounts for this customer
    await pool.execute(
      'UPDATE customer_discounts SET is_active = 0 WHERE customer_id = ?',
      [customerId]
    );
    
    // Insert new discount
    const [result] = await pool.execute(
      `INSERT INTO customer_discounts 
       (customer_id, discount_percentage, start_date, end_date, is_active, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        discount_percentage,
        start_date,
        end_date,
        is_active !== undefined ? is_active : true,
        adminId
      ]
    );
    
    // Get the created discount
    const [discounts] = await pool.execute(
      `SELECT cd.*, 
       u.name as created_by_name
       FROM customer_discounts cd
       LEFT JOIN users u ON cd.created_by = u.id
       WHERE cd.id = ?`,
      [result.insertId]
    );
    
    res.json({
      success: true,
      message: 'تم حفظ خصم العميل بنجاح',
      data: {
        discount: discounts[0]
      }
    });
  } catch (error) {
    console.error('Set customer discount error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ خصم العميل'
    });
  }
};

// Delete customer discount
export const deleteCustomerDiscount = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    await pool.execute(
      'UPDATE customer_discounts SET is_active = 0 WHERE customer_id = ?',
      [customerId]
    );
    
    res.json({
      success: true,
      message: 'تم حذف خصم العميل بنجاح'
    });
  } catch (error) {
    console.error('Delete customer discount error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف خصم العميل'
    });
  }
};

// Get all customer discounts (for admin)
export const getAllCustomerDiscounts = async (req, res) => {
  try {
    const [discounts] = await pool.execute(
      `SELECT cd.*, 
       u.name as customer_name,
       u.email as customer_email,
       creator.name as created_by_name
       FROM customer_discounts cd
       LEFT JOIN users u ON cd.customer_id = u.id
       LEFT JOIN users creator ON cd.created_by = creator.id
       ORDER BY cd.created_at DESC`
    );
    
    res.json({
      success: true,
      data: {
        discounts
      }
    });
  } catch (error) {
    console.error('Get all customer discounts error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب خصومات العملاء'
    });
  }
};

// Get current customer's own discount (for customers)
export const getMyDiscount = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }
    
    // Verify user is a customer
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    if (users[0].role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة متاحة للعملاء فقط'
      });
    }
    
    // Get active discount
    const [discounts] = await pool.execute(
      `SELECT cd.*, 
       u.name as created_by_name
       FROM customer_discounts cd
       LEFT JOIN users u ON cd.created_by = u.id
       WHERE cd.customer_id = ? AND cd.is_active = 1
       ORDER BY cd.created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    // Convert MySQL TINYINT(1) to boolean
    const formattedDiscount = discounts.length > 0 ? {
      ...discounts[0],
      is_active: Boolean(discounts[0].is_active)
    } : null;
    
    res.json({
      success: true,
      data: {
        discount: formattedDiscount
      }
    });
  } catch (error) {
    console.error('Get my discount error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب خصمك'
    });
  }
};
