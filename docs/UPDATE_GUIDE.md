# دليل التحديث - نظام الأدوار والصلاحيات

## ما تم إضافته

### 1. تحديث نظام الأدوار
- تم تغيير الأدوار من `(user, admin)` إلى `(admin, employee, customer)`
- جميع المستخدمين الجدد يحصلون على role: `customer` تلقائياً

### 2. نظام الصلاحيات للموظفين
- جدول `employee_permissions` لإدارة صلاحيات الموظفين
- الـ admin يمكنه تحديد صلاحيات كل موظف (view, create, edit, delete)
- الصلاحيات تشمل: users, categories, products, orders

### 3. Dashboards مختلفة
- **Admin Dashboard**: إدارة كاملة (المستخدمين، المنتجات، الأقسام، الطلبات)
- **Employee Dashboard**: حسب الصلاحيات المحددة من الـ admin
- **Customer Dashboard**: عرض الطلبات والمشتريات

## خطوات التحديث

### 1. تحديث قاعدة البيانات

قم بتشغيل ملف `back/config/db-update.sql` في phpMyAdmin:

1. افتح `http://localhost/phpmyadmin`
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على تبويب **SQL**
4. افتح ملف `back/config/db-update.sql` وانسخ محتواه
5. الصق المحتوى واضغط **Go**

أو قم بتشغيل الأوامر يدوياً (راجع `back/DATABASE_UPDATE.md`)

### 2. إعادة تشغيل الباك إند

```bash
cd back
# أوقف الخادم الحالي (Ctrl+C)
npm run dev
```

### 3. تحديث الفرونت إند

الفرونت إند محدث تلقائياً. إذا كنت تستخدم `AuthContext.backend.tsx`، تأكد من تحديثه.

## استخدام النظام

### إنشاء مستخدم Admin

**الطريقة 1: من phpMyAdmin**
```sql
-- قم بتغيير البيانات
INSERT INTO users (name, email, password, role) 
VALUES ('المدير', 'admin@king.com', '$2a$10$YourHashedPassword', 'admin');
```

**الطريقة 2: من API**
1. سجّل مستخدم جديد عادي
2. غيّر role من phpMyAdmin إلى `admin`

### إدارة صلاحيات الموظفين

بعد تسجيل الدخول كـ admin:

1. **إنشاء موظف**: سجّل مستخدم جديد ثم غيّر role إلى `employee`
2. **تعيين الصلاحيات**: استخدم API:
   ```
   PUT /api/admin/employees/:employeeId/permissions
   {
     "permissions": [
       {
         "permission_type": "products",
         "can_view": true,
         "can_create": true,
         "can_edit": true,
         "can_delete": false
       },
       {
         "permission_type": "orders",
         "can_view": true,
         "can_create": false,
         "can_edit": true,
         "can_delete": false
       }
     ]
   }
   ```

## API Endpoints الجديدة

### Admin Routes (`/api/admin`)
- `GET /api/admin/users` - جلب جميع المستخدمين
- `GET /api/admin/users/:id` - جلب مستخدم محدد
- `PUT /api/admin/users/:id/role` - تحديث دور المستخدم
- `DELETE /api/admin/users/:id` - حذف مستخدم
- `GET /api/admin/employees` - جلب جميع الموظفين
- `PUT /api/admin/employees/:employeeId/permissions` - تعيين صلاحيات موظف

### Employee Routes (`/api/employee`)
- `GET /api/employee/permissions` - جلب صلاحيات الموظف

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` - جلب بيانات Dashboard (تختلف حسب role)

## ملاحظات مهمة

1. **المستخدمون الجدد**: يحصلون على role `customer` تلقائياً
2. **الـ Admin**: لديه صلاحيات كاملة على كل شيء
3. **الـ Employee**: يحتاج صلاحيات محددة من الـ admin
4. **الـ Customer**: يمكنه فقط عرض طلباته ومشترياته

## استكشاف الأخطاء

### المستخدم لا يظهر في الجدول
- تأكد من تشغيل `db-update.sql`
- تحقق من أن role في الجدول محدث
- راجع console logs في الباك إند

### خطأ في الصلاحيات
- تأكد من أن المستخدم لديه role صحيح
- تحقق من وجود صلاحيات في جدول `employee_permissions` للموظفين

### Dashboard لا يعمل
- تأكد من أن role المستخدم صحيح
- تحقق من الاتصال بالباك إند
- راجع console في المتصفح
