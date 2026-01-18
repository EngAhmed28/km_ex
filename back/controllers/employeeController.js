import pool from '../config/database.js';

// Get employee permissions
export const getEmployeePermissions = async (req, res) => {
  try {
    const employeeId = req.user.userId;
    
    const [permissions] = await pool.execute(
      'SELECT * FROM employee_permissions WHERE employee_id = ?',
      [employeeId]
    );
    
    res.json({
      success: true,
      data: {
        permissions
      }
    });
  } catch (error) {
    console.error('Get employee permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الصلاحيات'
    });
  }
};

// Check if employee has permission for specific action
export const checkPermission = async (req, res, next) => {
  try {
    const { permissionType, action } = req.params;
    const employeeId = req.user.userId;
    
    // Get user role
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [employeeId]
    );
    
    if (users.length === 0 || users[0].role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول'
      });
    }
    
    // Check permission
    const [permissions] = await pool.execute(
      'SELECT * FROM employee_permissions WHERE employee_id = ? AND permission_type = ?',
      [employeeId, permissionType]
    );
    
    if (permissions.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }
    
    const permission = permissions[0];
    const actionField = `can_${action}`;
    
    if (!permission[actionField]) {
      return res.status(403).json({
        success: false,
        message: `ليس لديك صلاحية ${action} لهذا المورد`
      });
    }
    
    req.permission = permission;
    next();
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من الصلاحيات'
    });
  }
};
