# دليل إعادة تعيين كلمة المرور

## الطريقة السريعة (من phpMyAdmin):

### الخطوة 1: افتح phpMyAdmin
- افتح XAMPP Control Panel
- اضغط على "Admin" بجانب MySQL

### الخطوة 2: اختر قاعدة البيانات
- اختر `king_of_muscles` من القائمة الجانبية

### الخطوة 3: شغّل هذا الأمر في تبويب SQL

**استبدل `your-email@example.com` بالبريد الإلكتروني الذي استخدمته في الطلب:**

```sql
-- كلمة المرور الجديدة: Password123
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' 
WHERE email = 'your-email@example.com';
```

**كلمة المرور الجديدة هي: `Password123`**

### الخطوة 4: سجل الدخول
- استخدم البريد الإلكتروني الذي أدخلته
- استخدم كلمة المرور: `Password123`

---

## إذا أردت كلمة مرور مختلفة:

### استخدم هذا الموقع لتوليد hash جديد:
https://bcrypt-generator.com/

1. أدخل كلمة المرور التي تريدها
2. اضغط "Generate Hash"
3. انسخ الـ hash
4. استخدمه في الأمر SQL:

```sql
UPDATE users 
SET password = 'PASTE_HASH_HERE' 
WHERE email = 'your-email@example.com';
```

---

## أو استخدم Node.js لتوليد hash:

افتح terminal وشغّل:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 10));"
```

ثم استخدم الـ hash في SQL.
