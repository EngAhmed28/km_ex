# تعليمات تشغيل Seed Data

## المشكلة الشائعة: الحقول الإضافية لا تظهر

إذا كانت الحقول الإضافية (country_of_origin, expiry_date, etc.) لا تظهر بعد تشغيل seed data، تأكد من:

## الخطوات المطلوبة بالترتيب:

### 1. تأكد من وجود الحقول في قاعدة البيانات

قم بتشغيل ملف التحقق:
```sql
-- في phpMyAdmin أو MySQL CLI
SOURCE back/config/verify-and-fix-seed.sql;
```

### 2. إذا لم تكن الحقول موجودة، قم بإضافتها:

```sql
-- في phpMyAdmin أو MySQL CLI
SOURCE back/config/db-products-additional-fields.sql;
```

### 3. تفريغ الجداول (اختياري - إذا كنت تريد إعادة تشغيل seed):

```sql
SOURCE back/config/truncate-tables.sql;
```

### 4. تشغيل seed data:

```sql
SOURCE back/config/seed-data.sql;
```

## التحقق من البيانات:

```sql
-- التحقق من وجود الحقول الإضافية في المنتجات
SELECT 
  id,
  name_ar,
  country_of_origin,
  expiry_date,
  manufacture_date,
  ingredients,
  usage_instructions_ar,
  safety_warnings_ar
FROM products
LIMIT 5;
```

## ملاحظات:

1. **ترتيب التشغيل مهم**: يجب تشغيل SQL scripts بالترتيب الصحيح
2. **الحقول الإضافية**: تأكد من تشغيل `db-products-additional-fields.sql` قبل seed data
3. **Foreign Keys**: إذا واجهت مشاكل مع foreign keys، استخدم `truncate-tables.sql` أولاً

## حل المشاكل:

### المشكلة: "Column 'country_of_origin' doesn't exist"
**الحل**: قم بتشغيل `db-products-additional-fields.sql` أولاً

### المشكلة: "Foreign key constraint fails"
**الحل**: قم بتشغيل `truncate-tables.sql` أولاً لإزالة البيانات القديمة

### المشكلة: "Cannot truncate table"
**الحل**: استخدم `truncate-tables.sql` الذي يستخدم DELETE بدلاً من TRUNCATE
