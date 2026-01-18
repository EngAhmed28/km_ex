-- إصلاح نهائي لجدول users
-- قم بتشغيل هذا في phpMyAdmin

-- 1. إصلاح عمود role ليكون NOT NULL
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer';

-- 2. التحقق من النتيجة
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'king_of_muscles' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role';
