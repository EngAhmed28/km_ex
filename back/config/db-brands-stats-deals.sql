-- Brands/Partners table
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site Statistics table
CREATE TABLE IF NOT EXISTS site_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_key VARCHAR(100) NOT NULL UNIQUE,
  stat_value VARCHAR(255) NOT NULL,
  stat_label_ar VARCHAR(255) NOT NULL,
  stat_label_en VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stat_key (stat_key),
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deal of the Day table
CREATE TABLE IF NOT EXISTS deals_of_day (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  product_id INT,
  discount_percentage DECIMAL(5, 2),
  image_url VARCHAR(500),
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dates (start_date, end_date),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_ar VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100) NOT NULL,
  color_gradient VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default stats
INSERT INTO site_stats (stat_key, stat_value, stat_label_ar, stat_label_en, icon_name, display_order, is_active) VALUES
('rating', '4.9/5', 'أفضل المنتجات', 'Best Products', 'flame', 1, TRUE),
('experience', '+15', 'سنوات خبرة', 'Years of Experience', 'trophy', 2, TRUE),
('products', '+200', 'منتج أصلي', 'Original Product', 'shield', 3, TRUE),
('customers', '+50k', 'عميل سعيد', 'Happy Customer', 'users', 4, TRUE)
ON DUPLICATE KEY UPDATE 
  stat_value = VALUES(stat_value),
  stat_label_ar = VALUES(stat_label_ar),
  stat_label_en = VALUES(stat_label_en),
  icon_name = VALUES(icon_name),
  display_order = VALUES(display_order);

-- Insert default goals (using INSERT IGNORE to avoid errors if already exists)
INSERT IGNORE INTO goals (title_ar, title_en, icon_name, color_gradient, display_order, is_active) VALUES
('بناء العضلات', 'Muscle Building', 'flame', 'bg-red-600', 1, TRUE),
('خسارة الوزن', 'Weight Loss', 'target', 'bg-blue-600', 2, TRUE),
('الطاقة والتحمل', 'Energy and Endurance', 'zap', 'bg-yellow-600', 3, TRUE),
('الصحة العامة', 'General Health', 'trophy', 'bg-emerald-600', 4, TRUE);
