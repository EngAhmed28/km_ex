import express from 'express';
import { 
  uploadCategoryImage as uploadCategoryMiddleware, 
  uploadProductImage as uploadProductMiddleware,
  uploadProductImages as uploadProductImagesMiddleware,
  uploadBrandImage as uploadBrandImageMiddleware,
  uploadDealImage as uploadDealImageMiddleware
} from '../middleware/upload.js';
import { 
  uploadCategoryImage, 
  uploadProductImage,
  uploadProductImages,
  uploadBrandImage,
  uploadDealImage
} from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Upload category image (Admin only)
router.post('/category', authenticateToken, requireAdmin, (req, res, next) => {
  uploadCategoryMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }
    next();
  });
}, uploadCategoryImage);

// Upload product image (single) (Admin only)
router.post('/product', authenticateToken, requireAdmin, (req, res, next) => {
  uploadProductMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }
    next();
  });
}, uploadProductImage);

// Upload product images (multiple) (Admin only)
router.post('/products', authenticateToken, requireAdmin, (req, res, next) => {
  uploadProductImagesMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصور'
      });
    }
    next();
  });
}, uploadProductImages);

// Upload brand image (Admin only)
router.post('/brand', authenticateToken, requireAdmin, (req, res, next) => {
  uploadBrandImageMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }
    next();
  });
}, uploadBrandImage);

// Upload deal image (Admin only)
router.post('/deal', authenticateToken, requireAdmin, (req, res, next) => {
  uploadDealImageMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }
    next();
  });
}, uploadDealImage);

export default router;
