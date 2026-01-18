import express from 'express';
import { uploadCategoryImage as uploadMiddleware } from '../middleware/upload.js';
import { uploadCategoryImage } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// Upload category image (Admin only)
router.post('/category', authenticateToken, requireAdmin, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'حدث خطأ أثناء رفع الصورة'
      });
    }
    next();
  });
}, uploadCategoryImage);

export default router;
