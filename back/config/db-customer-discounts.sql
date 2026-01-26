-- جدول خصومات العملاء
CREATE TABLE IF NOT EXISTS customer_discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  discount_percentage DECIMAL(5, 2) NOT NULL COMMENT 'نسبة الخصم من 0 إلى 100',
  start_date DATE NOT NULL COMMENT 'تاريخ بداية الخصم',
  end_date DATE NOT NULL COMMENT 'تاريخ نهاية الخصم',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'حالة تفعيل الخصم',
  created_by INT NULL COMMENT 'المدير الذي أنشأ الخصم',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customer_id (customer_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_is_active (is_active),
  CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
