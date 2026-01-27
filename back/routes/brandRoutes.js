import express from 'express';
import { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand, toggleBrandStatus } from '../controllers/brandController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public route - get active brands
router.get('/', getAllBrands);

// Protected routes (require authentication)
router.use(authenticateToken);

// Get brand by ID
router.get('/:id', [
  param('id').isInt().withMessage('معرف البراند غير صحيح'),
  handleValidationErrors
], getBrandById);

// Admin/Employee routes
router.post('/', [
  body('name').trim().notEmpty().withMessage('اسم البراند مطلوب'),
  body('name_en').optional({ checkFalsy: true, nullable: true }).trim(),
  body('logo_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as URL (allow relative URLs like /uploads/brands/...)
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
    .withMessage('رابط الشعار غير صحيح'),
  body('website_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as absolute URL
      if (typeof value === 'string') {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage('رابط الموقع غير صحيح'),
  body('display_order').optional().isInt().withMessage('ترتيب العرض يجب أن يكون رقماً'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'create'), createBrand);

router.put('/:id', [
  param('id').isInt().withMessage('معرف البراند غير صحيح'),
  body('name').optional().trim().notEmpty().withMessage('اسم البراند غير صحيح'),
  body('name_en').optional({ checkFalsy: true, nullable: true }).trim(),
  body('logo_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as URL (allow relative URLs like /uploads/brands/...)
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
    .withMessage('رابط الشعار غير صحيح'),
  body('website_url')
    .optional({ checkFalsy: true, nullable: true })
    .custom((value) => {
      // Allow null, undefined, or empty string
      if (value === null || value === undefined || value === '') {
        return true;
      }
      // If value exists, validate it as absolute URL
      if (typeof value === 'string') {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage('رابط الموقع غير صحيح'),
  body('display_order').optional().isInt().withMessage('ترتيب العرض يجب أن يكون رقماً'),
  body('is_active').optional().isBoolean().withMessage('حالة التفعيل غير صحيحة'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), updateBrand);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف البراند غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'edit'), toggleBrandStatus);

router.delete('/:id', [
  param('id').isInt().withMessage('معرف البراند غير صحيح'),
  handleValidationErrors
], requireAdminOrPermission('products', 'delete'), deleteBrand);

export default router;
