import express from 'express';
import {
  getProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
  setPrimaryImage
} from '../controllers/productImageController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all images for a product
router.get('/product/:productId', [
  param('productId').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], getProductImages);

// Add image to product
router.post('/product/:productId', [
  param('productId').isInt().withMessage('معرف المنتج غير صحيح'),
  body('image_url').trim().notEmpty().withMessage('رابط الصورة مطلوب'),
  body('is_primary').optional().isBoolean().withMessage('is_primary يجب أن يكون true أو false'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('display_order يجب أن يكون رقم صحيح موجب'),
  handleValidationErrors
], addProductImage);

// Update product image
router.put('/:imageId', [
  param('imageId').isInt().withMessage('معرف الصورة غير صحيح'),
  body('is_primary').optional().isBoolean().withMessage('is_primary يجب أن يكون true أو false'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('display_order يجب أن يكون رقم صحيح موجب'),
  handleValidationErrors
], updateProductImage);

// Delete product image
router.delete('/:imageId', [
  param('imageId').isInt().withMessage('معرف الصورة غير صحيح'),
  handleValidationErrors
], deleteProductImage);

// Set primary image
router.put('/:imageId/primary', [
  param('imageId').isInt().withMessage('معرف الصورة غير صحيح'),
  handleValidationErrors
], setPrimaryImage);

export default router;
