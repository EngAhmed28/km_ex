import pool from '../config/database.js';

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const [reviews] = await pool.execute(
      `SELECT 
        pr.id,
        pr.rating,
        pr.comment,
        pr.helpful_count,
        pr.is_verified_purchase,
        pr.created_at,
        u.name as user_name,
        u.id as user_id,
        COUNT(rh.id) as helpful_count_actual
      FROM product_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN review_helpful rh ON pr.id = rh.review_id
      WHERE pr.product_id = ? AND pr.is_approved = TRUE
      GROUP BY pr.id
      ORDER BY pr.created_at DESC`,
      [productId]
    );

    // Format reviews
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userName: review.user_name || 'مستخدم مجهول',
      userId: review.user_id,
      rating: review.rating,
      comment: review.comment,
      helpfulCount: parseInt(review.helpful_count_actual) || 0,
      isVerifiedPurchase: Boolean(review.is_verified_purchase),
      date: new Date(review.created_at).toISOString().split('T')[0]
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقييمات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new review
export const createProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    // Check if user already reviewed this product
    const [existingReview] = await pool.execute(
      'SELECT id FROM product_reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقييم هذا المنتج من قبل'
      });
    }

    // Check if user has purchased this product (for verified purchase)
    const [orders] = await pool.execute(
      `SELECT oi.id 
       FROM order_items oi
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       LIMIT 1`,
      [userId, productId]
    );

    const isVerifiedPurchase = orders.length > 0;

    // Create review (auto-approve for now, can be changed to require admin approval)
    const [result] = await pool.execute(
      `INSERT INTO product_reviews 
       (product_id, user_id, rating, comment, is_verified_purchase, is_approved) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [productId, userId, rating, comment || null, isVerifiedPurchase]
    );

    // Update product rating (trigger should handle this, but we'll update manually too)
    const [avgRating] = await pool.execute(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM product_reviews 
       WHERE product_id = ? AND is_approved = TRUE`,
      [productId]
    );

    const avgRatingValue = parseFloat(avgRating[0].avg_rating || 0);
    const reviewsCountValue = parseInt(avgRating[0].count || 0);
    
    await pool.execute(
      'UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?',
      [avgRatingValue, reviewsCountValue, productId]
    );

    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      data: {
        review: {
          id: result.insertId,
          rating,
          comment,
          isVerifiedPurchase
        }
      }
    });
  } catch (error) {
    console.error('Create product review error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التقييم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }

    // Check if user already marked this review as helpful
    const [existing] = await pool.execute(
      'SELECT id FROM review_helpful WHERE user_id = ? AND review_id = ?',
      [userId, reviewId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقييم هذه المراجعة من قبل'
      });
    }

    // Add helpful mark
    await pool.execute(
      'INSERT INTO review_helpful (review_id, user_id) VALUES (?, ?)',
      [reviewId, userId]
    );

    // Update helpful_count
    await pool.execute(
      `UPDATE product_reviews 
       SET helpful_count = (
         SELECT COUNT(*) FROM review_helpful WHERE review_id = ?
       ) 
       WHERE id = ?`,
      [reviewId, reviewId]
    );

    res.json({
      success: true,
      message: 'تم تسجيل المراجعة كمفيدة'
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل المراجعة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's review for a product (to check if they can review)
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.json({
        success: true,
        data: {
          hasReviewed: false,
          review: null
        }
      });
    }

    const [reviews] = await pool.execute(
      `SELECT pr.*, u.name as user_name
       FROM product_reviews pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.product_id = ? AND pr.user_id = ?`,
      [productId, userId]
    );

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          hasReviewed: false,
          review: null
        }
      });
    }

    const review = reviews[0];
    res.json({
      success: true,
      data: {
        hasReviewed: true,
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقييم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
