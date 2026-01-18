# اختبار التسجيل - خطوات التشخيص

## الخطوة 1: إصلاح عمود role

في phpMyAdmin، قم بتشغيل:

```sql
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer';
```

## الخطوة 2: إعادة تشغيل الباك إند

```bash
cd back
# أوقف الخادم (Ctrl+C)
npm run dev
```

## الخطوة 3: اختبار التسجيل

### من الفرونت إند:
1. اذهب إلى صفحة التسجيل
2. أدخل بيانات:
   - الاسم: أحمد محمد
   - البريد: test@test.com
   - كلمة المرور: Password123
3. راقب console في الباك إند

### أو من Postman/Thunder Client:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "test@test.com",
  "password": "Password123"
}
```

## الخطوة 4: مراقبة Console

في console الباك إند، يجب أن ترى:

```
🔄 Attempting to insert user: { name: 'أحمد محمد', email: 'test@test.com', role: 'customer' }
🔄 Database: king_of_muscles
🔄 Current database: king_of_muscles
🔄 Insert result: { insertId: 1, affectedRows: 1, ... }
✅ User registered successfully: { userId: 1, email: 'test@test.com', name: 'أحمد محمد' }
✅ Verified user exists in database: { id: 1, name: 'أحمد محمد', ... }
```

## الخطوة 5: التحقق من phpMyAdmin

1. افتح `http://localhost/phpmyadmin`
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على جدول `users`
4. اضغط على **Browse**
5. يجب أن ترى المستخدم الجديد

## الخطوة 6: اختبار API

افتح:
```
http://localhost:5000/api/test/db-test
```

يجب أن ترى `usersCount` أكبر من 0.

## إذا لم يظهر المستخدم

1. **تحقق من console logs** - هل هناك أي أخطاء؟
2. **تحقق من قاعدة البيانات** - هل أنت متصل بـ `king_of_muscles`؟
3. **تحقق من phpMyAdmin** - اضغط على **Browse** في جدول `users`
4. **جرب SELECT مباشرة**:
   ```sql
   SELECT * FROM users;
   ```

## أخطاء شائعة

### خطأ: "Unknown database"
- تحقق من ملف `.env` - `DB_NAME=king_of_muscles`
- تأكد من إنشاء قاعدة البيانات

### خطأ: "Table doesn't exist"
- قم بتشغيل `back/config/db-init.sql` في phpMyAdmin

### خطأ: "Column 'role' cannot be null"
- قم بتشغيل `back/config/db-fix-final.sql` في phpMyAdmin
