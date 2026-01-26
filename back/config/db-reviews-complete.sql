-- ============================================
-- ملف شامل لإنشاء جداول التقييمات
-- ============================================

USE king_of_muscles;

-- ============================================
-- 1. التأكد من وجود أعمدة rating و reviews_count في جدول products
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.00;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;

-- تحديث القيم الموجودة إذا كانت NULL
UPDATE products SET rating = 0.00 WHERE rating IS NULL;
UPDATE products SET reviews_count = 0 WHERE reviews_count IS NULL;

-- ============================================
-- 2. إنشاء جدول product_reviews
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE, -- الموافقة التلقائية (يمكن تغييرها لـ FALSE إذا أردت موافقة يدوية)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_is_approved (is_approved),
  INDEX idx_created_at (created_at),
  -- منع المستخدم من إضافة أكثر من مراجعة واحدة لكل منتج
  UNIQUE KEY unique_user_product_review (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. إنشاء جدول review_helpful
-- ============================================
CREATE TABLE IF NOT EXISTS review_helpful (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review_helpful (user_id, review_id),
  INDEX idx_review_id (review_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. حذف Triggers القديمة إن وجدت (لتفادي الأخطاء)
-- ============================================
DROP TRIGGER IF EXISTS update_product_rating_after_review_insert;
DROP TRIGGER IF EXISTS update_product_rating_after_review_update;
DROP TRIGGER IF EXISTS update_product_rating_after_review_delete;

-- ============================================
-- 5. إنشاء Triggers لتحديث rating و reviews_count تلقائياً
-- ============================================
DELIMITER //

-- Trigger عند إضافة تقييم جديد
CREATE TRIGGER update_product_rating_after_review_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = NEW.product_id;
END//

-- Trigger عند تحديث تقييم
CREATE TRIGGER update_product_rating_after_review_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = NEW.product_id;
END//

-- Trigger عند حذف تقييم
CREATE TRIGGER update_product_rating_after_review_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0.00),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = OLD.product_id;
END//

DELIMITER ;

-- ============================================
-- 6. التحقق من الجداول والأعمدة
-- ============================================
SELECT 'الجداول والأعمدة:' AS 'التحقق';
SHOW TABLES LIKE 'product_reviews';
SHOW TABLES LIKE 'review_helpful';

SELECT 'أعمدة rating و reviews_count في products:' AS 'التحقق';
SHOW COLUMNS FROM products WHERE Field IN ('rating', 'reviews_count');

-- ============================================
-- 7. عرض معلومات الجداول
-- ============================================
SELECT 'معلومات جدول product_reviews:' AS 'التحقق';
DESCRIBE product_reviews;

SELECT 'معلومات جدول review_helpful:' AS 'التحقق';
DESCRIBE review_helpful;

-- ============================================
-- ملاحظات:
-- ============================================
-- 1. جدول product_reviews: يحتوي على التقييمات
--    - rating: من 1 إلى 5
--    - comment: نص التقييم (اختياري)
--    - is_verified_purchase: هل المشتري اشترى المنتج؟
--    - is_approved: هل التقييم معتمد؟ (TRUE = معتمد تلقائياً)
--
-- 2. جدول review_helpful: يحتوي على المستخدمين الذين وجدوا التقييم مفيداً
--    - منع المستخدم من التصويت أكثر من مرة على نفس التقييم
--
-- 3. Triggers: تحديث rating و reviews_count تلقائياً في جدول products
--
-- 4. للاستخدام:
--    - قم بتشغيل هذا الملف في phpMyAdmin أو MySQL CLI
--    - جميع الجداول ستُنشأ تلقائياً
--    - التقييمات الجديدة ستُعتمد تلقائياً (is_approved = TRUE)
-- ============================================
