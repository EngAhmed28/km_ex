import express from 'express';
import { getAllUsers, getUserById, updateUserRole, updateUser, toggleUserStatus, deleteUser } from '../controllers/adminController.js';
import { setEmployeePermissions, getAllEmployees } from '../controllers/adminEmployeeController.js';
import { getCustomerDiscount, setCustomerDiscount, deleteCustomerDiscount, getAllCustomerDiscounts } from '../controllers/customerDiscountController.js';
import { requireAdmin, requireAdminOrPermission } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Users management - allow admin or employees with users permission
router.get('/users', requireAdminOrPermission('users', 'view'), getAllUsers);
router.get('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('users', 'view'), getUserById);
router.put('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('email').optional().trim().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('users', 'edit'), updateUser);
router.put('/users/:id/role', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  body('role').isIn(['admin', 'employee', 'customer']).withMessage('الدور غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('users', 'edit'), updateUserRole);
router.put('/users/:id/toggle-status', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('users', 'edit'), toggleUserStatus);
router.delete('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('users', 'delete'), deleteUser);

// Employee management - admin only
router.get('/employees', requireAdmin, getAllEmployees);
router.put('/employees/:employeeId/permissions', [
  param('employeeId').isInt().withMessage('معرف الموظف غير صحيح'),
  body('permissions').isArray().withMessage('الصلاحيات يجب أن تكون مصفوفة'),
  handleValidationErrors
], requireAdmin, setEmployeePermissions);

// Customer discounts management - admin only
router.get('/customers/:customerId/discount', [
  param('customerId').isInt().withMessage('معرف العميل غير صحيح'),
  handleValidationErrors
], requireAdmin, getCustomerDiscount);
router.put('/customers/:customerId/discount', [
  param('customerId').isInt().withMessage('معرف العميل غير صحيح'),
  body('discount_percentage').isFloat({ min: 0, max: 100 }).withMessage('نسبة الخصم يجب أن تكون بين 0 و 100'),
  body('start_date').isISO8601().withMessage('تاريخ البداية غير صحيح'),
  body('end_date').isISO8601().withMessage('تاريخ النهاية غير صحيح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون true أو false'),
  handleValidationErrors
], requireAdmin, setCustomerDiscount);
router.delete('/customers/:customerId/discount', [
  param('customerId').isInt().withMessage('معرف العميل غير صحيح'),
  handleValidationErrors
], requireAdmin, deleteCustomerDiscount);
router.get('/customers/discounts', requireAdmin, getAllCustomerDiscounts);

export default router;
