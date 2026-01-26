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

// Check if user is admin or has specific permission as employee
export const requireAdminOrPermission = (permissionType, action = 'view') => {
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

      // Admin always has access
      if (userRole === 'admin') {
        req.user.role = userRole;
        return next();
      }

      // For employees, check permissions
      if (userRole === 'employee') {
        const [permissions] = await pool.execute(
          'SELECT * FROM employee_permissions WHERE employee_id = ? AND permission_type = ?',
          [req.user.userId, permissionType]
        );

        if (permissions.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
          });
        }

        const permission = permissions[0];
        const actionField = `can_${action}`;
        
        // Check if can_view is true (1 or true)
        const hasView = permission.can_view === true || permission.can_view === 1 || permission.can_view === '1';
        
        if (!hasView) {
          return res.status(403).json({
            success: false,
            message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
          });
        }

        // For actions other than view, check specific permission
        if (action !== 'view') {
          const hasAction = permission[actionField] === true || permission[actionField] === 1 || permission[actionField] === '1';
          if (!hasAction) {
            return res.status(403).json({
              success: false,
              message: `ليس لديك صلاحية ${action} لهذا المورد`
            });
          }
        }

        req.user.role = userRole;
        req.permission = permission;
        return next();
      }

      // Not admin or employee
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء التحقق من الصلاحيات'
      });
    }
  };
};
