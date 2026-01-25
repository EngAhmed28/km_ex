-- تفريغ جداول الأقسام والمنتجات
-- تحذير: هذا الملف سيحذف جميع البيانات من الجداول!

USE king_of_muscles;

-- تعطيل فحص Foreign Keys مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- حذف البيانات من الجداول المرتبطة أولاً
-- حذف order_items (مرتبط ب products)
DELETE FROM order_items;

-- حذف review_helpful (مرتبط ب product_reviews)
DELETE FROM review_helpful;

-- حذف product_reviews (مرتبط ب products)
DELETE FROM product_reviews;

-- حذف product_images (مرتبط ب products)
DELETE FROM product_images;

-- حذف products (مرتبط ب categories)
DELETE FROM products;

-- حذف categories
DELETE FROM categories;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE product_images AUTO_INCREMENT = 1;
ALTER TABLE product_reviews AUTO_INCREMENT = 1;
ALTER TABLE review_helpful AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;

-- إعادة تفعيل فحص Foreign Keys
SET FOREIGN_KEY_CHECKS = 1;

-- عرض رسالة تأكيد
SELECT 'تم تفريغ جميع الجداول بنجاح!' as message;
SELECT 'Categories count:' as info, COUNT(*) as count FROM categories;
SELECT 'Products count:' as info, COUNT(*) as count FROM products;
