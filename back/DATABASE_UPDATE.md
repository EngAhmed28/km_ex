# تحديث قاعدة البيانات

## خطوات التحديث

### 1. تحديث جدول users

قم بتشغيل هذا الأمر في phpMyAdmin أو MySQL:

```sql
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') DEFAULT 'customer';
```

### 2. إنشاء الجداول الجديدة

قم بتشغيل محتوى ملف `back/config/db-update.sql` في phpMyAdmin:

1. افتح `http://localhost/phpmyadmin`
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على تبويب **SQL**
4. افتح ملف `back/config/db-update.sql` وانسخ محتواه
5. الصق المحتوى واضغط **Go**

أو قم بتشغيل الأوامر التالية واحداً تلو الآخر:

```sql
-- إنشاء جدول permissions للـ employee
CREATE TABLE IF NOT EXISTS employee_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  permission_type ENUM('users', 'categories', 'products', 'orders') NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_permission (employee_id, permission_type),
  INDEX idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إنشاء جدول categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. التحقق من التحديث

بعد التحديث، تحقق من:
- جدول `users` يحتوي على role: `admin`, `employee`, `customer`
- جدول `employee_permissions` موجود
- جدول `categories` موجود

## إنشاء مستخدم Admin

لإنشاء مستخدم admin، قم بتشغيل:

```sql
-- قم بتغيير البيانات حسب رغبتك
INSERT INTO users (name, email, password, role) 
VALUES ('المدير', 'admin@king.com', '$2a$10$YourHashedPasswordHere', 'admin');
```

أو استخدم API للتسجيل ثم غيّر الدور من phpMyAdmin.

## ملاحظات

- جميع المستخدمين الجدد سيحصلون على role: `customer` تلقائياً
- يمكن للـ admin تغيير دور أي مستخدم من API أو phpMyAdmin
- الـ employee يحتاج إلى صلاحيات محددة من الـ admin
