import pool from '../config/database.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [users] = await pool.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المستخدمين',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب بيانات المستخدم'
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'employee', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'الدور غير صحيح'
      });
    }
    
    // Prevent changing own role
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تغيير دورك الخاص'
      });
    }
    
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث دور المستخدم بنجاح',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث دور المستخدم'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }
    
    // Build update query
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
    
    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const [users] = await pool.execute(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث بيانات المستخدم'
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent disabling own account
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تعطيل حسابك الخاص'
      });
    }
    
    // Get current status
    const [users] = await pool.execute(
      'SELECT is_active FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    const newStatus = !users[0].is_active;
    
    await pool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );
    
    res.json({
      success: true,
      message: newStatus ? 'تم تفعيل المستخدم بنجاح' : 'تم تعطيل المستخدم بنجاح',
      data: {
        is_active: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير حالة المستخدم'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الخاص'
      });
    }
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المستخدم'
    });
  }
};
