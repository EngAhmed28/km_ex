-- إنشاء جدول product_reviews للمراجعات والتقييمات
-- هذا الجدول منفصل عن جدول products لسهولة الإدارة

USE king_of_muscles;

-- إنشاء جدول product_reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE, -- للموافقة على المراجعة قبل عرضها
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

-- إنشاء جدول review_helpful للمستخدمين الذين وجدوا المراجعة مفيدة
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

-- دالة لحساب متوسط التقييمات وتحديثه في جدول products
-- يمكن استدعاء هذه الدالة بعد إضافة أو تحديث مراجعة
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_product_rating_after_review_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = (
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    )
  WHERE id = NEW.product_id;
END//

CREATE TRIGGER IF NOT EXISTS update_product_rating_after_review_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = (
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    )
  WHERE id = NEW.product_id;
END//

CREATE TRIGGER IF NOT EXISTS update_product_rating_after_review_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products
  SET 
    rating = COALESCE((
      SELECT AVG(rating) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0),
    reviews_count = COALESCE((
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = OLD.product_id AND is_approved = TRUE
    ), 0)
  WHERE id = OLD.product_id;
END//

DELIMITER ;

-- التحقق من الجداول
SHOW TABLES LIKE 'product_reviews';
SHOW TABLES LIKE 'review_helpful';
