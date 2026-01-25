# Seed Data للأقسام والمنتجات

## الوصف
هذا الملف يحتوي على بيانات تجريبية (seed data) لإضافة أقسام ومنتجات تجريبية إلى قاعدة البيانات.

## المحتويات

### الأقسام (5 أقسام):
1. مكملات بروتين (Protein Supplements)
2. مكملات الكرياتين (Creatine Supplements)
3. مكملات زيادة الوزن (Mass Gainers)
4. مكملات قبل التمرين (Pre-Workout)
5. فيتامينات ومكملات غذائية (Vitamins & Supplements)

### المنتجات (8 منتجات):
1. واي بروتين آيزوليت - 2.27 كجم
2. كازين بروتين - امتصاص بطيء
3. كرياتين مونوهيدرات نقي
4. كرياتين اوريجينال لاب ٣٠٠ جرام ٦٠
5. سيرياس ماس - زيادة ضخمة
6. بري ووركاوت انرجي
7. فيتامين د3 + ك2
8. اوريجينال واي كونسنتريت 1 كيلو

## كيفية الاستخدام

### المتطلبات:
1. يجب أن تكون الجداول موجودة في قاعدة البيانات
2. يجب تشغيل SQL scripts التالية أولاً:
   - `db-update.sql` (لإنشاء جدول categories)
   - `db-products-update-safe.sql` (لتحديث جدول products)
   - `db-products-additional-fields.sql` (لإضافة الحقول الإضافية)

### خطوات التشغيل:

#### في phpMyAdmin:
1. افتح phpMyAdmin
2. اختر قاعدة البيانات `king_of_muscles`
3. اضغط على "SQL" في القائمة العلوية
4. انسخ محتوى ملف `seed-data.sql` والصقه
5. اضغط "Go" أو "تنفيذ"

#### في MySQL CLI:
```bash
mysql -u root -p king_of_muscles < back/config/seed-data.sql
```

#### في Node.js (اختياري):
يمكنك إنشاء script لتشغيل seed data برمجياً:

```javascript
import pool from './config/database.js';
import fs from 'fs';
import path from 'path';

const seedData = fs.readFileSync(
  path.join(process.cwd(), 'back/config/seed-data.sql'),
  'utf8'
);

// تقسيم SQL إلى statements منفصلة
const statements = seedData.split(';').filter(s => s.trim());

for (const statement of statements) {
  if (statement.trim()) {
    await pool.execute(statement);
  }
}

console.log('Seed data inserted successfully!');
```

## ملاحظات مهمة

1. **الصور**: مسارات الصور في seed data هي مسارات افتراضية. يجب رفع الصور الفعلية إلى مجلد `/uploads/` المناسب.

2. **التواريخ**: التواريخ في seed data هي أمثلة. يمكنك تعديلها حسب احتياجاتك.

3. **الأسعار**: الأسعار بالعملة المحلية (يمكن تعديلها).

4. **التقييمات**: التقييمات وعدد المراجعات هي بيانات تجريبية.

5. **الحقول الإضافية**: جميع الحقول الإضافية (country_of_origin, expiry_date, etc.) موجودة في seed data.

## التحقق من البيانات

بعد تشغيل seed data، يمكنك التحقق من البيانات:

```sql
-- عرض جميع الأقسام
SELECT * FROM categories;

-- عرض جميع المنتجات
SELECT id, name_ar, name_en, price, category_id FROM products;

-- عرض المنتجات مع أسماء الأقسام
SELECT 
  p.id,
  p.name_ar,
  p.name_en,
  p.price,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

## حذف البيانات (إذا لزم الأمر)

```sql
-- حذف جميع المنتجات
DELETE FROM products;

-- حذف جميع الأقسام (سيتم حذف المنتجات المرتبطة تلقائياً إذا كان ON DELETE CASCADE)
DELETE FROM categories;

-- إعادة تعيين AUTO_INCREMENT
ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
```

## تحديث البيانات

يمكنك تعديل ملف `seed-data.sql` لإضافة أو تعديل البيانات حسب احتياجاتك.
