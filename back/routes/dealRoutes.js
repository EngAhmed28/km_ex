import express from 'express';
import { getActiveDeal, getAllDeals, getDealById, createDeal, updateDeal, deleteDeal, toggleDealStatus } from '../controllers/dealController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public route - get active deal
router.get('/active', getActiveDeal);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get all deals (Admin only)
router.get('/', requireAdminOrPermission('products', 'view'), getAllDeals);

// Get deal by ID
router.get('/:id', [
  param('id').isInt().withMessage('معرف الصفقة غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'view'), getDealById);

// Admin/Employee routes
router.post('/', [
  body('title_ar').trim().notEmpty().withMessage('عنوان الصفقة بالعربية مطلوب'),
  body('title_en').trim().notEmpty().withMessage('عنوان الصفقة بالإنجليزية مطلوب'),
  body('description_ar').optional().trim(),
  body('description_en').optional().trim(),
  body('product_id').optional().isInt().withMessage('معرف المنتج غير صحيح'),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('نسبة الخصم يجب أن تكون بين 0 و 100'),
  body('image_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as URL (allow relative URLs like /uploads/deals/...)
      if (typeof value === 'string') {
        // Allow relative URLs (starting with /)
        if (value.startsWith('/')) {
          return true;
        }
        // Validate absolute URLs
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage('رابط الصورة غير صحيح'),
  body('start_date').notEmpty().withMessage('تاريخ البداية مطلوب'),
  body('end_date').notEmpty().withMessage('تاريخ النهاية مطلوب'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'create'), createDeal);

router.put('/:id', [
  param('id').isInt().withMessage('معرف الصفقة غير صحيح'),
  body('title_ar').optional().trim().notEmpty().withMessage('عنوان الصفقة بالعربية غير صحيح'),
  body('title_en').optional().trim().notEmpty().withMessage('عنوان الصفقة بالإنجليزية غير صحيح'),
  body('description_ar').optional().trim(),
  body('description_en').optional().trim(),
  body('product_id').optional().isInt().withMessage('معرف المنتج غير صحيح'),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('نسبة الخصم يجب أن تكون بين 0 و 100'),
  body('image_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as URL (allow relative URLs like /uploads/deals/...)
      if (typeof value === 'string') {
        // Allow relative URLs (starting with /)
        if (value.startsWith('/')) {
          return true;
        }
        // Validate absolute URLs
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage('رابط الصورة غير صحيح'),
  body('start_date').optional().notEmpty().withMessage('تاريخ البداية غير صحيح'),
  body('end_date').optional().notEmpty().withMessage('تاريخ النهاية غير صحيح'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), updateDeal);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف الصفقة غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), toggleDealStatus);

router.delete('/:id', [
  param('id').isInt().withMessage('معرف الصفقة غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'delete'), deleteDeal);

export default router;
