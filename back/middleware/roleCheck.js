// Middleware to check user role
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        });
      }

      // Get user role from database
      const pool = (await import('../config/database.js')).default;
      const [users] = await pool.execute(
        'SELECT role FROM users WHERE id = ?',
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود'
        });
      }

      const userRole = users[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
        });
      }

      req.user.role = userRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء التحقق من الصلاحيات'
      });
    }
  };
};

// Check if user is admin
export const requireAdmin = requireRole('admin');

// Check if user is admin or employee
export const requireAdminOrEmployee = requireRole('admin', 'employee');
