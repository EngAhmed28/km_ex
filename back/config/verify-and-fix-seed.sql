-- التحقق من وجود الحقول الإضافية وإصلاحها إذا لزم الأمر
USE king_of_muscles;

-- التحقق من وجود الحقول
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'king_of_muscles' 
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME IN (
    'country_of_origin',
    'expiry_date',
    'manufacture_date',
    'ingredients',
    'usage_instructions_ar',
    'usage_instructions_en',
    'safety_warnings_ar',
    'safety_warnings_en'
  )
ORDER BY COLUMN_NAME;

-- إذا لم تكن الحقول موجودة، قم بتشغيل db-products-additional-fields.sql أولاً
-- ثم قم بتشغيل seed-data.sql مرة أخرى
