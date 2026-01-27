-- Seed Data for Goals (الأهداف)
-- قم بتشغيل هذا الملف لإدراج بيانات الأهداف الافتراضية

USE king_of_muscles;

-- حذف البيانات القديمة (اختياري - قم بإلغاء التعليق إذا كنت تريد حذف البيانات القديمة)
-- DELETE FROM goals;
-- ALTER TABLE goals AUTO_INCREMENT = 1;

-- إدراج الأهداف (مع تجنب التكرار)
INSERT IGNORE INTO goals (title_ar, title_en, icon_name, color_gradient, display_order, is_active) VALUES
('بناء العضلات', 'Muscle Building', 'flame', 'bg-red-600', 1, TRUE),
('خسارة الوزن', 'Weight Loss', 'target', 'bg-blue-600', 2, TRUE),
('الطاقة والتحمل', 'Energy and Endurance', 'zap', 'bg-yellow-600', 3, TRUE),
('الصحة العامة', 'General Health', 'trophy', 'bg-emerald-600', 4, TRUE);

-- التحقق من البيانات المدرجة
SELECT * FROM goals ORDER BY display_order ASC;
