-- Create goal_products table to link goals with products
-- This allows multiple products to be associated with multiple goals (many-to-many relationship)

CREATE TABLE IF NOT EXISTS goal_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_goal_product (goal_id, product_id),
  INDEX idx_goal_id (goal_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
