# دليل البدء السريع - XAMPP

## الخطوات السريعة لإعداد المشروع مع XAMPP

### ✅ الخطوة 1: تشغيل MySQL في XAMPP

1. افتح **XAMPP Control Panel**
2. اضغط **Start** بجانب **MySQL** ✅
3. انتظر حتى يتحول إلى اللون الأخضر

### ✅ الخطوة 2: إنشاء قاعدة البيانات

**الطريقة الأسهل:**

1. افتح المتصفح: `http://localhost/phpmyadmin`
2. اضغط على تبويب **SQL** في الأعلى
3. افتح ملف `back/config/db-init.sql` من المشروع
4. انسخ **كل** المحتوى والصقه في مربع SQL
5. اضغط **Go** أو **تنفيذ** ✅

ستجد قاعدة بيانات جديدة اسمها `king_of_muscles` مع 3 جداول.

### ✅ الخطوة 3: إعداد الباك إند

```powershell
cd back
npm install
npm run dev
```

الباك إند سيعمل على: `http://localhost:5000` ✅

**ملاحظة:** ملف `.env` تم إنشاؤه تلقائياً بإعدادات XAMPP الافتراضية (كلمة المرور فارغة)

### ✅ الخطوة 4: إعداد الفرونت إند

```powershell
cd front
npm install
npm run dev
```

الفرونت إند سيعمل على: `http://localhost:5173` ✅

## اختبار سريع

1. افتح: `http://localhost:5000/api/health`
   - يجب أن ترى: `{"success":true,"message":"الخادم يعمل بشكل صحيح"}`

2. افتح: `http://localhost:5173`
   - يجب أن ترى الموقع يعمل

## ربط الفرونت إند بالباك إند

لتفعيل الاتصال الحقيقي بالباك إند:

1. في `front/context/`:
   - احفظ `AuthContext.tsx` كنسخة احتياطية
   - استبدله بـ `AuthContext.backend.tsx`

2. أنشئ ملف `front/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. أعد تشغيل الفرونت إند

## مساعدة

- راجع `SETUP.md` للتفاصيل الكاملة
- راجع `back/XAMPP_SETUP.md` لإعدادات XAMPP المتقدمة
- راجع `PROJECT_STRUCTURE.md` لفهم هيكل المشروع
