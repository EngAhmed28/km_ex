# دليل الإعداد الكامل - King of Muscles

## الخطوة 1: إعداد قاعدة البيانات MySQL (XAMPP)

### تشغيل XAMPP:
1. افتح **XAMPP Control Panel**
2. اضغط **Start** بجانب **MySQL** (يجب أن يتحول إلى اللون الأخضر)
3. تأكد من أن MySQL يعمل على البورت **3306**

### إنشاء قاعدة البيانات:

**الطريقة الأولى: استخدام phpMyAdmin (الأسهل)**
1. افتح المتصفح واذهب إلى: `http://localhost/phpmyadmin`
2. اضغط على تبويب **SQL** في الأعلى
3. افتح ملف `back/config/db-init.sql` وانسخ كل محتواه
4. الصق المحتوى في مربع SQL واضغط **Go** أو **تنفيذ**

**الطريقة الثانية: استخدام Command Line**
1. افتح **Command Prompt** أو **PowerShell**
2. انتقل إلى مجلد XAMPP MySQL:
```bash
cd C:\xampp\mysql\bin
```
3. قم بتشغيل:
```bash
mysql.exe -u root -p < "E:\projects\km_ex\back\config\db-init.sql"
```
(استبدل المسار بمسار المشروع الخاص بك)

**ملاحظة:** في XAMPP، كلمة مرور MySQL الافتراضية عادةً **فارغة** (اضغط Enter فقط عند طلب كلمة المرور)

## الخطوة 2: إعداد الباك إند

1. انتقل إلى مجلد الباك إند:
```bash
cd back
```

2. قم بتثبيت الحزم:
```bash
npm install
```

3. أنشئ ملف `.env` (يمكنك نسخه من `.env.example`):
```bash
# في Windows PowerShell
Copy-Item .env.example .env

# في Linux/Mac
cp .env.example .env
```

4. قم بتعديل ملف `.env` وأضف بيانات قاعدة البيانات:

**لـ XAMPP (كلمة المرور عادةً فارغة):**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=king_of_muscles
DB_PORT=3306

JWT_SECRET=your-very-secret-key-change-this-in-production-change-this-random-string
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

**ملاحظة:** إذا قمت بتغيير كلمة مرور MySQL في XAMPP، ضعها في `DB_PASSWORD`

5. قم بتشغيل الباك إند:
```bash
npm run dev
```

الباك إند سيعمل على `http://localhost:5000`

## الخطوة 3: إعداد الفرونت إند

1. انتقل إلى مجلد الفرونت إند:
```bash
cd front
```

2. قم بتثبيت الحزم:
```bash
npm install
```

3. (اختياري) أنشئ ملف `.env.local` للاتصال بالباك إند:
```env
VITE_API_URL=http://localhost:5000/api
```

4. قم بتشغيل الفرونت إند:
```bash
npm run dev
```

الفرونت إند سيعمل على `http://localhost:5173`

## الخطوة 4: ربط الفرونت إند بالباك إند

لتفعيل الاتصال بالباك إند الحقيقي بدلاً من localStorage:

1. في مجلد `front/context/`:
   - قم بنسخ `AuthContext.backend.tsx` إلى `AuthContext.tsx` (احفظ النسخة القديمة كنسخة احتياطية)

2. تأكد من أن ملف `front/utils/api.js` موجود

3. في ملف `front/pages/Login.tsx`، تأكد من استخدام `useAuth` من `AuthContext`

## اختبار النظام

### 1. اختبار تسجيل مستخدم جديد:
- اذهب إلى صفحة التسجيل
- أدخل:
  - الاسم: أحمد محمد
  - البريد: ahmed@test.com
  - كلمة المرور: Password123
- يجب أن يتم إنشاء الحساب بنجاح

### 2. اختبار تسجيل الدخول:
- استخدم نفس البيانات المسجلة
- يجب أن يتم تسجيل الدخول بنجاح

### 3. اختبار Dashboard:
- بعد تسجيل الدخول، اذهب إلى Dashboard
- يجب أن ترى بيانات المستخدم والإحصائيات

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات:
- تأكد من أن MySQL يعمل
- تحقق من بيانات الاتصال في ملف `.env`
- تأكد من إنشاء قاعدة البيانات والجداول

### خطأ CORS:
- تأكد من أن `FRONTEND_URL` في `.env` صحيح
- تأكد من أن الفرونت إند يعمل على نفس البورت المحدد

### خطأ في المصادقة:
- تأكد من أن `JWT_SECRET` موجود في `.env`
- تحقق من أن التوكن يتم إرساله في Header

## الملفات المهمة

- `back/server.js` - ملف الخادم الرئيسي
- `back/config/database.js` - إعدادات قاعدة البيانات
- `back/controllers/authController.js` - منطق المصادقة
- `back/middleware/validation.js` - التحقق من النماذج
- `front/utils/api.js` - دوال الاتصال بالباك إند
- `front/context/AuthContext.tsx` - سياق المصادقة

## ملاحظات

- جميع النماذج تحتوي على تحقق تلقائي
- كلمات المرور مشفرة باستخدام bcrypt
- JWT tokens تستخدم للمصادقة
- Dashboard محمي ويتطلب تسجيل الدخول
