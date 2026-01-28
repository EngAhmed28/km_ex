-- Add site_settings table for managing basic site data
USE king_of_muscles;

CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_name_ar VARCHAR(255) DEFAULT 'King of Muscles',
  site_name_en VARCHAR(255) DEFAULT 'King of Muscles',
  logo_url VARCHAR(500) NULL,
  footer_description_ar TEXT NULL,
  footer_description_en TEXT NULL,
  -- Social Media Links
  facebook_url VARCHAR(500) NULL,
  instagram_url VARCHAR(500) NULL,
  twitter_url VARCHAR(500) NULL,
  youtube_url VARCHAR(500) NULL,
  -- Contact Information
  address_ar VARCHAR(500) NULL,
  address_en VARCHAR(500) NULL,
  phone VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  -- Footer Links
  shop_links JSON NULL, -- Array of {label_ar, label_en, url}
  support_links JSON NULL, -- Array of {label_ar, label_en, url}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO site_settings (
  site_name_ar,
  site_name_en,
  footer_description_ar,
  footer_description_en,
  address_ar,
  address_en,
  phone,
  email,
  shop_links,
  support_links
) VALUES (
  'King of Muscles',
  'King of Muscles',
  'King of Muscles هو وجهتك الأولى للحصول على أجود أنواع المكملات الغذائية في العالم العربي.',
  'King of Muscles is your first destination to get the best types of nutritional supplements in the Arab world.',
  'الرياض، المملكة العربية السعودية - شارع التحلية',
  'Riyadh, Kingdom of Saudi Arabia - Tahlia Street',
  '+966 50 123 4567',
  'info@kingofmuscles.com',
  JSON_ARRAY(
    JSON_OBJECT('label_ar', 'الأكثر مبيعاً', 'label_en', 'Best Sellers', 'url', '#'),
    JSON_OBJECT('label_ar', 'المنتجات الجديدة', 'label_en', 'New Products', 'url', '#'),
    JSON_OBJECT('label_ar', 'الأقسام', 'label_en', 'Categories', 'url', '#'),
    JSON_OBJECT('label_ar', 'العروض الخاصة', 'label_en', 'Special Offers', 'url', '#')
  ),
  JSON_ARRAY(
    JSON_OBJECT('label_ar', 'الأسئلة الشائعة', 'label_en', 'FAQs', 'url', '#'),
    JSON_OBJECT('label_ar', 'سياسة الإرجاع', 'label_en', 'Return Policy', 'url', '#'),
    JSON_OBJECT('label_ar', 'الشحن والتوصيل', 'label_en', 'Shipping and Delivery', 'url', '#'),
    JSON_OBJECT('label_ar', 'اتصل بنا', 'label_en', 'Contact Us', 'url', '#')
  )
) ON DUPLICATE KEY UPDATE id=id;
