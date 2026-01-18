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
      
      dashboardData.stats = {
        totalUsers: usersCount[0]?.count || 0,
        totalProducts: productsCount[0]?.count || 0,
        totalOrders: ordersCount[0]?.count || 0,
        totalCategories: categoriesCount[0]?.count || 0
      };
    } else if (user.role === 'employee') {
      // Employee dashboard - get permissions
      const [permissions] = await pool.execute(
        'SELECT * FROM employee_permissions WHERE employee_id = ?',
        [userId]
      );
      
      dashboardData.permissions = permissions;
      
      // Get stats based on permissions
      const stats = {};
      for (const perm of permissions) {
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
      
      try {
        const [orders] = await pool.execute(
          'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
          [userId]
        );
        ordersCount = orders[0]?.count || 0;
        
        const [totals] = await pool.execute(
          'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = ? AND status = "delivered"',
          [userId]
        );
        totalSpent = parseFloat(totals[0]?.total || 0);
      } catch (err) {
        console.log('Orders table not available');
      }
      
      dashboardData.stats = {
        ordersCount,
        totalSpent,
        memberSince: user.created_at
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
