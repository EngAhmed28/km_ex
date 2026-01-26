# جداول التقييمات (Product Reviews Tables)

## الجداول الجديدة

### 1. جدول `product_reviews`
جدول التقييمات الرئيسي - يحتوي على جميع تقييمات المنتجات.

**الأعمدة:**
- `id` - معرف فريد للتقييم
- `product_id` - معرف المنتج (Foreign Key → products.id)
- `user_id` - معرف المستخدم (Foreign Key → users.id)
- `rating` - التقييم من 1 إلى 5 (INT, NOT NULL)
- `comment` - نص التقييم (TEXT, اختياري)
- `helpful_count` - عدد المستخدمين الذين وجدوا التقييم مفيداً (INT, DEFAULT 0)
- `is_verified_purchase` - هل المشتري اشترى المنتج؟ (BOOLEAN, DEFAULT FALSE)
- `is_approved` - هل التقييم معتمد؟ (BOOLEAN, DEFAULT TRUE)
- `created_at` - تاريخ الإنشاء
- `updated_at` - تاريخ التحديث

**القواعد:**
- `UNIQUE KEY (user_id, product_id)` - منع المستخدم من إضافة أكثر من تقييم واحد لكل منتج
- `CHECK (rating >= 1 AND rating <= 5)` - التقييم يجب أن يكون بين 1 و 5

---

### 2. جدول `review_helpful`
جدول المستخدمين الذين وجدوا التقييمات مفيدة.

**الأعمدة:**
- `id` - معرف فريد
- `review_id` - معرف التقييم (Foreign Key → product_reviews.id)
- `user_id` - معرف المستخدم (Foreign Key → users.id)
- `created_at` - تاريخ التصويت

**القواعد:**
- `UNIQUE KEY (user_id, review_id)` - منع المستخدم من التصويت أكثر من مرة على نفس التقييم

---

### 3. تحديثات على جدول `products`
تم إضافة عمودين جديدين:

- `rating` - متوسط التقييمات (DECIMAL(3, 2), DEFAULT 0.00)
- `reviews_count` - عدد التقييمات المعتمدة (INT, DEFAULT 0)

---

## Triggers التلقائية

تم إنشاء 3 Triggers لتحديث `rating` و `reviews_count` تلقائياً:

1. **`update_product_rating_after_review_insert`**
   - يتم تشغيله عند إضافة تقييم جديد
   - يحسب متوسط التقييمات وعددها ويحدث جدول `products`

2. **`update_product_rating_after_review_update`**
   - يتم تشغيله عند تحديث تقييم
   - يعيد حساب المتوسط والعدد

3. **`update_product_rating_after_review_delete`**
   - يتم تشغيله عند حذف تقييم
   - يعيد حساب المتوسط والعدد

---

## كيفية الاستخدام

### 1. إنشاء الجداول:
```bash
mysql -u root -p king_of_muscles < back/config/db-reviews-complete.sql
```

أو في phpMyAdmin:
- افتح ملف `back/config/db-reviews-complete.sql`
- انسخ المحتوى والصقه في phpMyAdmin
- اضغط "Go" أو "تنفيذ"

### 2. التحقق من الجداول:
```sql
-- عرض جميع الجداول
SHOW TABLES LIKE '%review%';

-- عرض بنية جدول product_reviews
DESCRIBE product_reviews;

-- عرض بنية جدول review_helpful
DESCRIBE review_helpful;

-- التحقق من أعمدة rating و reviews_count في products
SHOW COLUMNS FROM products WHERE Field IN ('rating', 'reviews_count');
```

### 3. إضافة تقييم تجريبي:
```sql
-- إضافة تقييم (يجب أن يكون product_id و user_id موجودين)
INSERT INTO product_reviews (product_id, user_id, rating, comment, is_approved)
VALUES (1, 1, 5, 'منتج ممتاز!', TRUE);

-- التحقق من تحديث rating و reviews_count في products
SELECT id, name, rating, reviews_count FROM products WHERE id = 1;
```

---

## ملاحظات مهمة

1. **الموافقة التلقائية**: التقييمات تُعتمد تلقائياً (`is_approved = TRUE`)
   - إذا أردت موافقة يدوية، غيّر `DEFAULT TRUE` إلى `DEFAULT FALSE` في جدول `product_reviews`

2. **الشراء الموثق**: يتم التحقق تلقائياً من خلال API
   - إذا كان المستخدم قد اشترى المنتج (order status = 'delivered')، يتم تعيين `is_verified_purchase = TRUE`

3. **التقييم الواحد لكل منتج**: المستخدم لا يمكنه إضافة أكثر من تقييم واحد لكل منتج
   - إذا حاول، سيظهر خطأ: "لقد قمت بتقييم هذا المنتج من قبل"

4. **التحديث التلقائي**: `rating` و `reviews_count` يتم تحديثهما تلقائياً عند:
   - إضافة تقييم جديد
   - تحديث تقييم موجود
   - حذف تقييم
   - الموافقة على تقييم (تغيير `is_approved`)

---

## API Endpoints

### جلب التقييمات:
```
GET /api/reviews/products/:productId
```

### إضافة تقييم (يتطلب تسجيل دخول):
```
POST /api/reviews/products/:productId
Body: { rating: 5, comment: "نص التقييم" }
```

### تحديد التقييم كمفيد (يتطلب تسجيل دخول):
```
POST /api/reviews/:reviewId/helpful
```

### التحقق من تقييم المستخدم:
```
GET /api/reviews/products/:productId/my-review
```

---

## الملفات ذات الصلة

- `back/config/db-reviews-complete.sql` - ملف SQL شامل لإنشاء جميع الجداول
- `back/config/db-product-reviews.sql` - الملف الأصلي (يمكن استخدامه أيضاً)
- `back/controllers/productReviewController.js` - Controller للتقييمات
- `back/routes/reviewRoutes.js` - Routes للتقييمات
- `front/pages/ProductDetail.tsx` - صفحة تفاصيل المنتج مع التقييمات
