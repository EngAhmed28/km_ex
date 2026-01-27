import express from 'express';
import { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal, toggleGoalStatus } from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public route - get active goals
router.get('/', getAllGoals);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get goal by ID
router.get('/:id', [
  param('id').isInt().withMessage('معرف الهدف غير صحيح'),
  handleValidationErrors
], getGoalById);

// Admin/Employee routes
router.post('/', [
  body('title_ar').trim().notEmpty().withMessage('عنوان الهدف بالعربية مطلوب'),
  body('title_en').trim().notEmpty().withMessage('عنوان الهدف بالإنجليزية مطلوب'),
  body('icon_name').trim().notEmpty().withMessage('اسم الأيقونة مطلوب'),
  body('color_gradient').trim().notEmpty().withMessage('اللون مطلوب'),
  body('display_order').optional().isInt().withMessage('ترتيب العرض يجب أن يكون رقماً'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'create'), createGoal);

router.put('/:id', [
  param('id').isInt().withMessage('معرف الهدف غير صحيح'),
  body('title_ar').optional().trim().notEmpty().withMessage('عنوان الهدف بالعربية غير صحيح'),
  body('title_en').optional().trim().notEmpty().withMessage('عنوان الهدف بالإنجليزية غير صحيح'),
  body('icon_name').optional().trim().notEmpty().withMessage('اسم الأيقونة غير صحيح'),
  body('color_gradient').optional().trim().notEmpty().withMessage('اللون غير صحيح'),
  body('display_order').optional().isInt().withMessage('ترتيب العرض يجب أن يكون رقماً'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), updateGoal);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف الهدف غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), toggleGoalStatus);

router.delete('/:id', [
  param('id').isInt().withMessage('معرف الهدف غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'delete'), deleteGoal);

export default router;
