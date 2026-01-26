import express from 'express';
import {
  getProductReviews,
  createProductReview,
  markReviewHelpful,
  getUserReview
} from '../controllers/productReviewController.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get all reviews for a product (public)
router.get('/products/:productId', [
  param('productId').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], getProductReviews);

// Get user's review for a product (requires auth)
router.get('/products/:productId/my-review', [
  param('productId').isInt().withMessage('معرف المنتج غير صحيح'),
  handleValidationErrors
], authenticateToken, getUserReview);

// Create a new review (requires auth)
router.post('/products/:productId', [
  param('productId').isInt().withMessage('معرف المنتج غير صحيح'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('التقييم يجب أن يكون بين 1 و 5'),
  body('comment').optional().isString().trim().isLength({ max: 1000 }).withMessage('التعليق يجب ألا يتجاوز 1000 حرف'),
  handleValidationErrors
], authenticateToken, createProductReview);

// Mark review as helpful (requires auth)
router.post('/:reviewId/helpful', [
  param('reviewId').isInt().withMessage('معرف المراجعة غير صحيح'),
  handleValidationErrors
], authenticateToken, markReviewHelpful);

export default router;
