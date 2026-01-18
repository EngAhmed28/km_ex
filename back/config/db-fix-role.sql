-- إصلاح عمود role ليكون NOT NULL
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer';

-- تحديث أي مستخدمين موجودين بدون role
UPDATE users SET role = 'customer' WHERE role IS NULL;
