-- تحديث جدول products ليشمل جميع الحقول المطلوبة
-- استخدم هذا السكريبت في phpMyAdmin

USE king_of_muscles;

-- إضافة الحقول الجديدة (إذا لم تكن موجودة)
-- ملاحظة: إذا ظهرت رسالة خطأ "Duplicate column name"، فهذا يعني أن العمود موجود بالفعل

-- إضافة name_ar
ALTER TABLE products ADD COLUMN name_ar VARCHAR(255) AFTER name;

-- إضافة name_en
ALTER TABLE products ADD COLUMN name_en VARCHAR(255) AFTER name_ar;

-- إضافة description_ar
ALTER TABLE products ADD COLUMN description_ar TEXT AFTER description;

-- إضافة description_en
ALTER TABLE products ADD COLUMN description_en TEXT AFTER description_ar;

-- إضافة old_price
ALTER TABLE products ADD COLUMN old_price DECIMAL(10, 2) NULL AFTER price;

-- إضافة rating
ALTER TABLE products ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.00 AFTER old_price;

-- إضافة reviews_count
ALTER TABLE products ADD COLUMN reviews_count INT DEFAULT 0 AFTER rating;

-- إضافة weight
ALTER TABLE products ADD COLUMN weight VARCHAR(100) NULL AFTER stock;

-- إضافة flavors (JSON)
ALTER TABLE products ADD COLUMN flavors JSON NULL AFTER weight;

-- إضافة nutrition (JSON)
ALTER TABLE products ADD COLUMN nutrition JSON NULL AFTER flavors;

-- إضافة slug
ALTER TABLE products ADD COLUMN slug VARCHAR(255) NULL AFTER name_en;

-- إضافة is_active
ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER stock;

-- تحديث name ليصبح name_ar إذا كان فارغاً
UPDATE products SET name_ar = name WHERE name_ar IS NULL OR name_ar = '';

-- تحديث name_en ليصبح name إذا كان name_en فارغاً
UPDATE products SET name_en = name WHERE name_en IS NULL OR name_en = '';

-- تحديث description ليصبح description_ar إذا كان description_ar فارغاً
UPDATE products SET description_ar = description WHERE description_ar IS NULL OR description_ar = '';

-- تحديث description_en ليصبح description إذا كان description_en فارغاً
UPDATE products SET description_en = description WHERE description_en IS NULL OR description_en = '';

-- إضافة indexes (إذا لم تكن موجودة)
-- ملاحظة: إذا ظهرت رسالة خطأ "Duplicate key name"، فهذا يعني أن الفهرس موجود بالفعل

-- إضافة index للـ slug
CREATE INDEX idx_slug ON products(slug);

-- إضافة index للـ is_active
CREATE INDEX idx_is_active ON products(is_active);

-- إضافة index للـ category_id (إذا لم يكن موجوداً)
CREATE INDEX idx_category_id ON products(category_id);

-- إضافة index للـ price
CREATE INDEX idx_price ON products(price);

-- تحديث image_url ليكون nullable
ALTER TABLE products MODIFY COLUMN image_url VARCHAR(500) NULL;

-- تحديث category ليكون nullable (لأننا نستخدم category_id الآن)
ALTER TABLE products MODIFY COLUMN category VARCHAR(100) NULL;

-- التحقق من بنية الجدول
DESCRIBE products;
