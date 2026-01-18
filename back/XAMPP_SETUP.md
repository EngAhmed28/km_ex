# إعداد XAMPP - King of Muscles Backend

## متطلبات XAMPP

- XAMPP مثبت على Windows
- Node.js مثبت
- npm مثبت

## الخطوات السريعة

### 1. تشغيل MySQL في XAMPP

1. افتح **XAMPP Control Panel**
2. اضغط **Start** بجانب **MySQL**
3. تأكد من أن البورت **3306** (افتراضي)

### 2. إنشاء قاعدة البيانات

#### الطريقة الأسهل - phpMyAdmin:

1. افتح المتصفح: `http://localhost/phpmyadmin`
2. اضغط على تبويب **SQL** في الأعلى
3. افتح ملف `back/config/db-init.sql`
4. انسخ كل المحتوى والصقه في مربع SQL
5. اضغط **Go** أو **تنفيذ**

#### أو استخدم Command Line:

```powershell
# في PowerShell
cd C:\xampp\mysql\bin
.\mysql.exe -u root -e "source E:\projects\km_ex\back\config\db-init.sql"
```

(استبدل المسار بمسار المشروع الخاص بك)

### 3. إعداد ملف .env

في مجلد `back/`، أنشئ ملف `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=king_of_muscles
DB_PORT=3306

JWT_SECRET=change-this-to-a-random-secret-key-in-production
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

**ملاحظات مهمة:**
- `DB_PASSWORD` فارغ في XAMPP الافتراضي
- إذا غيرت كلمة مرور MySQL، ضعها هنا
- `JWT_SECRET` يجب أن يكون سرياً وقوياً في الإنتاج

### 4. تثبيت الحزم وتشغيل الباك إند

```bash
cd back
npm install
npm run dev
```

الباك إند سيعمل على: `http://localhost:5000`

## التحقق من الإعداد

### اختبار الاتصال بقاعدة البيانات:

افتح `http://localhost/phpmyadmin` وتحقق من وجود قاعدة بيانات `king_of_muscles` مع الجداول:
- `users`
- `products`
- `orders`

### اختبار API:

افتح المتصفح أو استخدم Postman:
- `http://localhost:5000/api/health` - يجب أن يعيد رسالة نجاح

## استكشاف الأخطاء

### خطأ: "Access denied for user 'root'@'localhost'"
- تأكد من أن `DB_PASSWORD` في `.env` صحيح
- جرب تركها فارغة أولاً
- إذا غيرت كلمة المرور، تأكد من وضعها في `.env`

### خطأ: "Can't connect to MySQL server"
- تأكد من أن MySQL يعمل في XAMPP Control Panel
- تحقق من أن البورت 3306 غير مستخدم من برنامج آخر
- جرب إعادة تشغيل MySQL في XAMPP

### خطأ: "Unknown database 'king_of_muscles'"
- تأكد من إنشاء قاعدة البيانات باستخدام `db-init.sql`
- تحقق من الاسم في ملف `.env` يطابق الاسم في قاعدة البيانات

## نصائح

1. **phpMyAdmin** أسهل طريقة لإدارة قاعدة البيانات
2. يمكنك إنشاء قاعدة البيانات يدوياً من phpMyAdmin ثم استيراد الجداول
3. احفظ نسخة احتياطية من قاعدة البيانات من phpMyAdmin قبل أي تحديثات كبيرة
