# King of Muscles - Backend API

Backend API للموقع الإلكتروني King of Muscles

## المتطلبات

- Node.js (v16 أو أحدث)
- MySQL (v8.0 أو أحدث)
- npm أو yarn

## التثبيت

1. تثبيت الحزم:
```bash
npm install
```

2. إعداد ملف البيئة:
```bash
cp .env.example .env
```

3. تعديل ملف `.env` بإضافة بيانات قاعدة البيانات:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=king_of_muscles
DB_PORT=3306

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
```

4. إنشاء قاعدة البيانات:
```bash
mysql -u root -p < config/db-init.sql
```

أو قم بتشغيل محتوى ملف `config/db-init.sql` في MySQL.

## التشغيل

### وضع التطوير:
```bash
npm run dev
```

### وضع الإنتاج:
```bash
npm start
```

الخادم سيعمل على `http://localhost:5000`

## API Endpoints

### المصادقة (Authentication)

- `POST /api/auth/register` - تسجيل مستخدم جديد
  ```json
  {
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "Password123"
  }
  ```

- `POST /api/auth/login` - تسجيل الدخول
  ```json
  {
    "email": "ahmed@example.com",
    "password": "Password123"
  }
  ```

- `GET /api/auth/me` - الحصول على بيانات المستخدم الحالي (يتطلب توكن)

### الداشبورد (Dashboard)

- `GET /api/dashboard` - الحصول على بيانات الداشبورد (يتطلب توكن)

- `PUT /api/dashboard/profile` - تحديث الملف الشخصي (يتطلب توكن)
  ```json
  {
    "name": "أحمد محمد",
    "email": "newemail@example.com"
  }
  ```

## التحقق من النماذج (Validation)

جميع النماذج تحتوي على تحقق تلقائي:

- **التسجيل**: الاسم (2-100 حرف)، البريد الإلكتروني (صيغة صحيحة)، كلمة المرور (6 أحرف على الأقل، تحتوي على حرف كبير وصغير ورقم)
- **تسجيل الدخول**: البريد الإلكتروني (صيغة صحيحة)، كلمة المرور (مطلوبة)

## الأمان

- كلمات المرور مشفرة باستخدام bcrypt
- JWT tokens للمصادقة
- Middleware للتحقق من صحة التوكن
- CORS مفعل للفرونت إند

## البنية

```
back/
├── config/
│   ├── database.js      # إعدادات قاعدة البيانات
│   └── db-init.sql      # سكريبت إنشاء قاعدة البيانات
├── controllers/
│   ├── authController.js      # منطق المصادقة
│   └── dashboardController.js # منطق الداشبورد
├── middleware/
│   ├── auth.js          # middleware للمصادقة
│   └── validation.js    # middleware للتحقق من النماذج
├── routes/
│   ├── authRoutes.js    # مسارات المصادقة
│   └── dashboardRoutes.js # مسارات الداشبورد
├── server.js            # ملف الخادم الرئيسي
└── package.json
```
