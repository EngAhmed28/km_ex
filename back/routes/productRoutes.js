import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleProductStatus 
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes - get active products only
router.get('/', [
  query('category').optional().trim(),
  query('category_id').optional().isInt().withMessage('معرف القسم غير صحيح'),
  query('search').optional().trim(),
  query('min_price').optional().isFloat().withMessage('الحد الأدنى للسعر غير صحيح'),
  query('max_price').optional().isFloat().withMessage('الحد الأقصى للسعر غير صحيح'),
  handleValidationErrors
], (req, res, next) => {
  // Force is_active=true for public routes
  req.query.is_active = 'true';
  next();
}, getAllProducts);

router.get('/:id', [
  param('id').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], getProductById);

// Admin routes - get all products (including inactive)
router.get('/admin/all', authenticateToken, requireAdmin, (req, res, next) => {
  // Set show_all to true to show all products including inactive ones
  req.query.show_all = 'true';
  delete req.query.is_active;
  next();
}, getAllProducts);

// Admin routes
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/', [
  body('name_ar').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 255 }).withMessage('الاسم العربي يجب أن يكون بين 2 و 255 حرف'),
  body('name_en').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 255 }).withMessage('الاسم الإنجليزي يجب أن يكون بين 2 و 255 حرف'),
  body('description_ar').optional({ checkFalsy: true }).trim(),
  body('description_en').optional({ checkFalsy: true }).trim(),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقم موجب'),
  body('old_price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('السعر القديم يجب أن يكون رقم موجب'),
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
  body('category_id').optional({ checkFalsy: true }).isInt().withMessage('معرف القسم غير صحيح'),
  body('stock').optional().isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم صحيح موجب'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('التقييم يجب أن يكون بين 0 و 5'),
  body('reviews_count').optional().isInt({ min: 0 }).withMessage('عدد التقييمات يجب أن يكون رقم صحيح موجب'),
  body('weight').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('الوزن يجب أن يكون أقل من 100 حرف'),
  body('flavors').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
    }
    return true;
  }).withMessage('النكهات يجب أن تكون مصفوفة'),
  body('nutrition').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
    }
    return true;
  }).withMessage('القيم الغذائية يجب أن تكون مصفوفة'),
  body('is_active').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
  }).withMessage('حالة المنتج يجب أن تكون true أو false'),
  handleValidationErrors
], createProduct);

router.put('/:id', [
  param('id').isInt().withMessage('معرف المنتج غير صحيح'),
  body('name_ar').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 255 }).withMessage('الاسم العربي يجب أن يكون بين 2 و 255 حرف'),
  body('name_en').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 255 }).withMessage('الاسم الإنجليزي يجب أن يكون بين 2 و 255 حرف'),
  body('description_ar').optional({ checkFalsy: true }).trim(),
  body('description_en').optional({ checkFalsy: true }).trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقم موجب'),
  body('old_price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('السعر القديم يجب أن يكون رقم موجب'),
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
  body('category_id').optional({ checkFalsy: true }).isInt().withMessage('معرف القسم غير صحيح'),
  body('stock').optional().isInt({ min: 0 }).withMessage('الكمية يجب أن تكون رقم صحيح موجب'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('التقييم يجب أن يكون بين 0 و 5'),
  body('reviews_count').optional().isInt({ min: 0 }).withMessage('عدد التقييمات يجب أن يكون رقم صحيح موجب'),
  body('weight').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('الوزن يجب أن يكون أقل من 100 حرف'),
  body('flavors').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
    }
    return true;
  }).withMessage('النكهات يجب أن تكون مصفوفة'),
  body('nutrition').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
    }
    return true;
  }).withMessage('القيم الغذائية يجب أن تكون مصفوفة'),
  body('is_active').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
  }).withMessage('حالة المنتج يجب أن تكون true أو false'),
  handleValidationErrors
], updateProduct);

router.put('/:id/toggle-status', [
  param('id').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], toggleProductStatus);

router.delete('/:id', [
  param('id').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], deleteProduct);

export default router;
