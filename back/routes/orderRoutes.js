import express from 'express';
import { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrPermission } from '../middleware/roleCheck.js';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Create order (public route - supports guests)
router.post('/',
  [
    body('items').isArray().withMessage('يجب إرسال قائمة المنتجات'),
    body('items.*.product_id').isInt().withMessage('معرف المنتج غير صحيح'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('الكمية يجب أن تكون أكبر من صفر'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('السعر غير صحيح'),
    body('total_amount').isFloat({ min: 0 }).withMessage('المبلغ الإجمالي غير صحيح'),
    body('phone').isString().withMessage('رقم الهاتف مطلوب'),
    body('guest_name').optional({ checkFalsy: true, nullable: true }).isString().withMessage('الاسم غير صحيح'),
    body('guest_email').optional({ checkFalsy: true, nullable: true }).isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    handleValidationErrors
  ],
  optionalAuth, // Optional - checks if user is logged in, but allows guests
  createOrder
);

// Get all orders (Admin or employees with orders view permission)
router.get('/',
  authenticateToken,
  requireAdminOrPermission('orders', 'view'),
  getAllOrders
);

// Get user orders (requires authentication)
router.get('/my-orders',
  authenticateToken,
  getUserOrders
);

// Update order status (Admin or employees with orders edit permission)
router.put('/:id/status',
  [
    param('id').isInt().withMessage('معرف الطلب غير صحيح'),
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('حالة الطلب غير صحيحة'),
    handleValidationErrors
  ],
  authenticateToken,
  requireAdminOrPermission('orders', 'edit'),
  updateOrderStatus
);

// Get order by ID (requires authentication if user wants to view their order)
router.get('/:id',
  [
    param('id').isInt().withMessage('معرف الطلب غير صحيح'),
    handleValidationErrors
  ],
  authenticateToken, // Optional - for guest orders, we'll handle it in controller
  getOrderById
);

export default router;
