import express from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public route - get site settings
router.get('/', getSiteSettings);

// Protected routes (require authentication)
router.use(authenticateToken);

// Update site settings (Admin/Employee only)
router.put('/', [
  body('site_name_ar').optional().trim(),
  body('site_name_en').optional().trim(),
  body('logo_url').optional().trim(),
  body('footer_description_ar').optional().trim(),
  body('footer_description_en').optional().trim(),
  body('facebook_url').optional().trim().isURL().withMessage('رابط Facebook غير صحيح'),
  body('instagram_url').optional().trim().isURL().withMessage('رابط Instagram غير صحيح'),
  body('twitter_url').optional().trim().isURL().withMessage('رابط Twitter غير صحيح'),
  body('youtube_url').optional().trim().isURL().withMessage('رابط YouTube غير صحيح'),
  body('address_ar').optional().trim(),
  body('address_en').optional().trim(),
  body('phone').optional().trim(),
  body('email').optional().trim().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('shop_links').optional().isArray().withMessage('روابط المتجر يجب أن تكون مصفوفة'),
  body('support_links').optional().isArray().withMessage('روابط الدعم يجب أن تكون مصفوفة'),
  handleValidationErrors
], requireAdminOrPermission('settings', 'edit'), updateSiteSettings);

export default router;
