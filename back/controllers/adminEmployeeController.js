import pool from '../config/database.js';

// Set employee permissions (Admin only)
export const setEmployeePermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { permissions } = req.body;
    
    // Verify employee exists and is actually an employee
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [employeeId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    if (users[0].role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'المستخدم ليس موظفاً'
      });
    }
    
    // Delete existing permissions
    await pool.execute(
      'DELETE FROM employee_permissions WHERE employee_id = ?',
      [employeeId]
    );
    
    // Insert new permissions
    for (const perm of permissions) {
      await pool.execute(
        `INSERT INTO employee_permissions 
         (employee_id, permission_type, can_view, can_create, can_edit, can_delete) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          perm.permission_type,
          perm.can_view || false,
          perm.can_create || false,
          perm.can_edit || false,
          perm.can_delete || false
        ]
      );
    }
    
    // Get updated permissions
    const [updatedPermissions] = await pool.execute(
      'SELECT * FROM employee_permissions WHERE employee_id = ?',
      [employeeId]
    );
    
    res.json({
      success: true,
      message: 'تم تحديث صلاحيات الموظف بنجاح',
      data: {
        permissions: updatedPermissions
      }
    });
  } catch (error) {
    console.error('Set employee permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث صلاحيات الموظف'
    });
  }
};

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.created_at,
       GROUP_CONCAT(
         CONCAT(ep.permission_type, ':', ep.can_view, ':', ep.can_create, ':', ep.can_edit, ':', ep.can_delete)
         SEPARATOR '|'
       ) as permissions
       FROM users u
       LEFT JOIN employee_permissions ep ON u.id = ep.employee_id
       WHERE u.role = 'employee'
       GROUP BY u.id, u.name, u.email, u.created_at`
    );
    
    // Format permissions
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      permissions: emp.permissions ? emp.permissions.split('|').map(p => {
        const [type, view, create, edit, del] = p.split(':');
        return {
          permission_type: type,
          can_view: view === '1',
          can_create: create === '1',
          can_edit: edit === '1',
          can_delete: del === '1'
        };
      }) : []
    }));
    
    res.json({
      success: true,
      data: {
        employees: formattedEmployees
      }
    });
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الموظفين'
    });
  }
};
