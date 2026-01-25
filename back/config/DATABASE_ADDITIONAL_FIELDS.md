# إضافة حقول إضافية لقاعدة البيانات

## الملفات المطلوبة

### 1. `db-products-additional-fields.sql`
يضيف الحقول التالية لجدول `products`:
- `country_of_origin` - بلد الصنع
- `expiry_date` - تاريخ الانتهاء
- `manufacture_date` - تاريخ الإنتاج
- `ingredients` - المكونات (JSON)
- `usage_instructions_ar` - طريقة الاستخدام بالعربي
- `usage_instructions_en` - طريقة الاستخدام بالإنجليزي
- `safety_warnings_ar` - تحذيرات السلامة بالعربي
- `safety_warnings_en` - تحذيرات السلامة بالإنجليزي

### 2. `db-product-reviews.sql`
ينشئ جدولين جديدين:
- `product_reviews` - جدول المراجعات والتقييمات
- `review_helpful` - جدول المستخدمين الذين وجدوا المراجعة مفيدة

## كيفية الاستخدام

### خطوة 1: تشغيل SQL Scripts

```bash
# في phpMyAdmin أو MySQL CLI
mysql -u root -p king_of_muscles < back/config/db-products-additional-fields.sql
mysql -u root -p king_of_muscles < back/config/db-product-reviews.sql
```

أو في phpMyAdmin:
1. افتح phpMyAdmin
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على "SQL" في القائمة العلوية
4. انسخ محتوى الملف `db-products-additional-fields.sql` والصقه
5. اضغط "Go" أو "تنفيذ"
6. كرر نفس الخطوات لملف `db-product-reviews.sql`

### خطوة 2: التحقق من النتيجة

```sql
-- التحقق من بنية جدول products
DESCRIBE products;

-- التحقق من جدول المراجعات
DESCRIBE product_reviews;
DESCRIBE review_helpful;
```

## الحقول الجديدة في جدول products

| الحقل | النوع | الوصف |
|------|------|-------|
| `country_of_origin` | VARCHAR(100) | بلد الصنع |
| `expiry_date` | DATE | تاريخ الانتهاء |
| `manufacture_date` | DATE | تاريخ الإنتاج |
| `ingredients` | JSON | المكونات (مصفوفة JSON) |
| `usage_instructions_ar` | TEXT | طريقة الاستخدام بالعربي |
| `usage_instructions_en` | TEXT | طريقة الاستخدام بالإنجليزي |
| `safety_warnings_ar` | TEXT | تحذيرات السلامة بالعربي |
| `safety_warnings_en` | TEXT | تحذيرات السلامة بالإنجليزي |

## جدول product_reviews

| الحقل | النوع | الوصف |
|------|------|-------|
| `id` | INT | المعرف |
| `product_id` | INT | معرف المنتج |
| `user_id` | INT | معرف المستخدم |
| `rating` | INT | التقييم (1-5) |
| `comment` | TEXT | تعليق المراجعة |
| `helpful_count` | INT | عدد من وجدوا المراجعة مفيدة |
| `is_verified_purchase` | BOOLEAN | شراء موثق |
| `is_approved` | BOOLEAN | موافقة على المراجعة |
| `created_at` | TIMESTAMP | تاريخ الإنشاء |
| `updated_at` | TIMESTAMP | تاريخ التحديث |

## Triggers التلقائية

تم إنشاء Triggers تلقائية لتحديث:
- `rating` - متوسط التقييمات
- `reviews_count` - عدد المراجعات

في جدول `products` عند إضافة/تحديث/حذف مراجعة.

## ملاحظات

- جميع الحقول الجديدة اختيارية (NULL)
- يمكن تحديثها من خلال API
- المراجعات تحتاج موافقة قبل عرضها (`is_approved = TRUE`)
- كل مستخدم يمكنه إضافة مراجعة واحدة فقط لكل منتج
