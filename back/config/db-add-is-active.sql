-- إضافة عمود is_active لجدول users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- تحديث جميع المستخدمين الموجودين ليكونوا نشطين
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;
