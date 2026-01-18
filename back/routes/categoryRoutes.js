import express from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../controllers/categoryController.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes - get active categories only
router.get('/', (req, res, next) => {
  // Force is_active=true for public routes
  req.query.is_active = 'true';
  next();
}, getAllCategories);

router.get('/:id', [
  param('id').isInt().withMessage('معرف القسم غير صحيح'),
  handleValidationErrors
], getCategoryById);

// Admin routes - get all categories (including inactive)
router.get('/admin/all', authenticateToken, requireAdmin, (req, res, next) => {
  // Set show_all to true to show all categories including inactive ones
  req.query.show_all = 'true';
  delete req.query.is_active;
  next();
}, getAllCategories);

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', [
  body('name').trim().notEmpty().withMessage('اسم القسم مطلوب').isLength({ min: 2, max: 255 }).withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  body('name_en').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('الاسم الإنجليزي يجب أن يكون أقل من 255 حرف'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('image_url').optional({ checkFalsy: true }).trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        // Check if it's a relative path
        if (value.startsWith('/')) {
          return true;
        }
        throw new Error('رابط الصورة غير صحيح');
      }
    }
    return true;
  }),
  body('is_active').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
  }).withMessage('حالة القسم يجب أن تكون true أو false'),
  handleValidationErrors
], createCategory);

router.put('/:id', [
  param('id').isInt().withMessage('معرف القسم غير صحيح'),
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 255 }).withMessage('الاسم يجب أن يكون بين 2 و 255 حرف'),
  body('name_en').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('الاسم الإنجليزي يجب أن يكون أقل من 255 حرف'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('image_url').optional({ checkFalsy: true }).trim().custom((value) => {
    if (value && value !== '') {
      try {
        new URL(value);
        return true;
      } catch {
        // Check if it's a relative path
        if (value.startsWith('/')) {
          return true;
        }
        throw new Error('رابط الصورة غير صحيح');
      }
    }
    return true;
  }),
  body('is_active').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
  }).withMessage('حالة القسم يجب أن تكون true أو false'),
  handleValidationErrors
], updateCategory);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف القسم غير صحيح'),
  handleValidationErrors
], toggleCategoryStatus);

router.delete('/:id', [
  param('id').isInt().withMessage('معرف القسم غير صحيح'),
  handleValidationErrors
], deleteCategory);

export default router;
