# King of Muscles - E-Commerce Platform

منصة تجارة إلكترونية متكاملة لبيع المكملات الغذائية

## هيكل المشروع

```
km_ex/
├── front/          # ملفات الفرونت إند (React + TypeScript)
├── back/           # ملفات الباك إند (Node.js + Express + MySQL)
└── docs/           # ملفات التوثيق والـ AI
```

## المتطلبات

- Node.js (v16 أو أحدث)
- MySQL (v8.0 أو أحدث)
- npm أو yarn

## التثبيت والتشغيل

### 1. الباك إند

```bash
cd back
npm install
cp .env.example .env
# قم بتعديل ملف .env بإضافة بيانات قاعدة البيانات
mysql -u root -p < config/db-init.sql
npm run dev
```

الباك إند سيعمل على `http://localhost:5000`

### 2. الفرونت إند

```bash
cd front
npm install
npm run dev
```

الفرونت إند سيعمل على `http://localhost:5173`

## المميزات

- ✅ نظام تسجيل دخول وتسجيل مستخدمين
- ✅ التحقق من النماذج (Form Validation)
- ✅ Dashboard للمستخدمين المسجلين
- ✅ قاعدة بيانات MySQL
- ✅ JWT Authentication
- ✅ API RESTful

## API Endpoints

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - بيانات المستخدم الحالي

### الداشبورد
- `GET /api/dashboard` - بيانات الداشبورد
- `PUT /api/dashboard/profile` - تحديث الملف الشخصي

## التوثيق

- [الباك إند](./back/README.md)
- [الفرونت إند](./front/README.md)
