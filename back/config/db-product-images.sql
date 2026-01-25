-- إنشاء جدول صور المنتجات
-- استخدم هذا السكريبت في phpMyAdmin

USE king_of_muscles;

-- إنشاء جدول product_images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_is_primary (is_primary),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إذا كان لديك صور موجودة في products.image_url، يمكنك نقلها:
-- INSERT INTO product_images (product_id, image_url, is_primary, display_order)
-- SELECT id, image_url, TRUE, 0 FROM products WHERE image_url IS NOT NULL AND image_url != '';
