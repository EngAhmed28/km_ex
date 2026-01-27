import express from 'express';
import { getAllStats, getStatById, updateStat, toggleStatStatus } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public route - get active stats
router.get('/', getAllStats);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get stat by ID
router.get('/:id', [
  param('id').isInt().withMessage('معرف الإحصائية غير صحيح'),
  handleValidationErrors
], getStatById);

// Admin/Employee routes
router.put('/:id', [
  param('id').isInt().withMessage('معرف الإحصائية غير صحيح'),
  body('stat_value').optional().trim().notEmpty().withMessage('قيمة الإحصائية غير صحيحة'),
  body('stat_label_ar').optional().trim().notEmpty().withMessage('تسمية الإحصائية بالعربية غير صحيحة'),
  body('stat_label_en').optional().trim().notEmpty().withMessage('تسمية الإحصائية بالإنجليزية غير صحيحة'),
  body('icon_name').optional().trim(),
  body('display_order').optional().isInt().withMessage('ترتيب العرض يجب أن يكون رقماً'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), updateStat);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف الإحصائية غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), toggleStatStatus);

export default router;
