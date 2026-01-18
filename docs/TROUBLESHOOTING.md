# حل مشكلة عدم ظهور المستخدمين في قاعدة البيانات

## المشكلة
المستخدم يتم إنشاؤه بنجاح لكنه لا يظهر في جدول `users` في قاعدة البيانات.

## الحلول المحتملة

### 1. التحقق من تحديث جدول users

**المشكلة:** جدول `users` قد لا يزال يحتوي على role القديم `('user', 'admin')` بدلاً من `('admin', 'employee', 'customer')`.

**الحل:**
1. افتح `http://localhost/phpmyadmin`
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على جدول `users`
4. اضغط على تبويب **Structure**
5. ابحث عن عمود `role` وتحقق من نوعه
6. إذا كان `ENUM('user', 'admin')`، قم بتشغيل:

```sql
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') DEFAULT 'customer';
```

### 2. اختبار الاتصال بقاعدة البيانات

افتح في المتصفح:
```
http://localhost:5000/api/test/db-test
```

هذا سيعرض:
- حالة الاتصال
- بنية جدول users
- جميع المستخدمين الموجودين
- عدد المستخدمين

### 3. التحقق من console logs

عند تسجيل مستخدم جديد، راقب console في الباك إند. يجب أن ترى:
```
🔄 Attempting to insert user: { name: '...', email: '...', role: 'customer' }
✅ User registered successfully: { userId: ..., email: '...', name: '...' }
✅ Verified user exists in database: { ... }
```

إذا رأيت خطأ، سيعطيك تفاصيل المشكلة.

### 4. التحقق من قاعدة البيانات الصحيحة

تأكد من أن ملف `.env` يحتوي على اسم قاعدة البيانات الصحيح:

```env
DB_NAME=king_of_muscles
```

### 5. التحقق من أن MySQL يعمل

1. افتح XAMPP Control Panel
2. تأكد من أن MySQL يعمل (أخضر)
3. جرب فتح `http://localhost/phpmyadmin`

### 6. إعادة إنشاء جدول users

**تحذير:** هذا سيحذف جميع المستخدمين الموجودين!

```sql
-- احذف الجدول
DROP TABLE IF EXISTS users;

-- أنشئه من جديد
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7. التحقق من الأخطاء في console

عند محاولة التسجيل، راقب console في الباك إند. إذا كان هناك خطأ، سيكون بهذا الشكل:

```
Register error: Error: ...
Error details: {
  message: '...',
  code: '...',
  sqlState: '...',
  sqlMessage: '...'
}
```

## خطوات التشخيص السريعة

1. **افتح:** `http://localhost:5000/api/test/db-test`
   - تحقق من وجود المستخدمين
   - تحقق من بنية الجدول

2. **جرب تسجيل مستخدم جديد** وراقب console

3. **تحقق من phpMyAdmin:**
   - افتح `http://localhost/phpmyadmin`
   - اختر `king_of_muscles`
   - اضغط على `users`
   - اضغط على **Browse** لرؤية جميع المستخدمين

4. **تحقق من role:**
   - في phpMyAdmin، اضغط على تبويب **Structure**
   - ابحث عن عمود `role`
   - تأكد أنه `ENUM('admin', 'employee', 'customer')`

## إذا استمرت المشكلة

1. أرسل output من `http://localhost:5000/api/test/db-test`
2. أرسل console logs من الباك إند عند محاولة التسجيل
3. أرسل screenshot من phpMyAdmin لجدول users
