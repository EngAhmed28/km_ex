import express from 'express';
import { getDashboard, updateProfile } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard data
router.get('/', getDashboard);

// Update profile
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('الاسم يجب أن يكون بين 2 و 100 حرف'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  
  handleValidationErrors
], updateProfile);

export default router;
