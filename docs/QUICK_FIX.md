# إصلاح سريع - مشكلة عدم ظهور المستخدمين

## المشكلة
المستخدم يتم إنشاؤه لكنه لا يظهر في جدول `users`.

## الحل السريع

### 1. إصلاح عمود role

في phpMyAdmin، قم بتشغيل هذا الأمر:

```sql
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer';
```

هذا سيضمن أن:
- عمود `role` لا يقبل NULL
- القيمة الافتراضية هي `customer`
- القيم المسموحة هي فقط: admin, employee, customer

### 2. التحقق من المستخدمين الموجودين

بعد الإصلاح، قم بتشغيل:

```sql
SELECT * FROM users;
```

يجب أن ترى جميع المستخدمين.

### 3. اختبار التسجيل

1. أعد تشغيل الباك إند (Ctrl+C ثم `npm run dev`)
2. جرب تسجيل مستخدم جديد
3. تحقق من console في الباك إند - يجب أن ترى:
   ```
   ✅ User registered successfully: { userId: ..., email: '...', name: '...' }
   ✅ Verified user exists in database: { ... }
   ```
4. تحقق من phpMyAdmin - اضغط على **Browse** في جدول `users`

### 4. اختبار قاعدة البيانات

افتح في المتصفح:
```
http://localhost:5000/api/test/db-test
```

هذا سيعرض جميع المستخدمين الموجودين في قاعدة البيانات.

## إذا استمرت المشكلة

1. **تحقق من console logs** في الباك إند عند التسجيل
2. **تحقق من phpMyAdmin** - اضغط على **Browse** لرؤية جميع المستخدمين
3. **افتح** `http://localhost:5000/api/test/db-test` وأرسل النتيجة

## ملاحظة مهمة

إذا كان لديك مستخدمين موجودين بدون role (NULL)، قم بتشغيل:

```sql
UPDATE users SET role = 'customer' WHERE role IS NULL;
```
