import express from 'express';
import { getAllUsers, getUserById, updateUserRole, updateUser, toggleUserStatus, deleteUser } from '../controllers/adminController.js';
import { setEmployeePermissions, getAllEmployees } from '../controllers/adminEmployeeController.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], getUserById);
router.put('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  body('email').optional().trim().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  handleValidationErrors
], updateUser);
router.put('/users/:id/role', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  body('role').isIn(['admin', 'employee', 'customer']).withMessage('الدور غير صحيح'),
  handleValidationErrors
], updateUserRole);
router.put('/users/:id/toggle-status', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], toggleUserStatus);
router.delete('/users/:id', [
  param('id').isInt().withMessage('معرف المستخدم غير صحيح'),
  handleValidationErrors
], deleteUser);

// Employee management
router.get('/employees', getAllEmployees);
router.put('/employees/:employeeId/permissions', [
  param('employeeId').isInt().withMessage('معرف الموظف غير صحيح'),
  body('permissions').isArray().withMessage('الصلاحيات يجب أن تكون مصفوفة'),
  handleValidationErrors
], setEmployeePermissions);

export default router;
