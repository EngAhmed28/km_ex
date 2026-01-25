# اختبار نظام الطلبات

## خطوات الاختبار:

### 1. تأكد أن الخوادم تعمل:
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5173

### 2. اختبار من المتصفح:

#### أ) اختبار كزائر (بدون حساب):
1. افتح المتصفح على: http://localhost:5173
2. اذهب إلى "المتجر" أو "Shop"
3. أضف منتج أو منتجين للسلة
4. اضغط على أيقونة السلة في الأعلى
5. اضغط على "إتمام الطلب" أو "Checkout"
6. املأ البيانات:
   - الاسم الكامل: (مثال: أحمد محمد)
   - البريد الإلكتروني: (مثال: test@example.com)
   - المحافظة: (مثال: القاهرة)
   - المدينة/الشارع: (مثال: مدينة نصر)
   - الهاتف: (مثال: 01234567890)
7. اختر طريقة الدفع
8. اضغط "تأكيد الطلب"

#### ب) التحقق من النتائج:
1. يجب أن تظهر رسالة نجاح
2. يجب أن يظهر رقم الطلب
3. يجب أن تظهر رسالة "تم إنشاء حسابك تلقائياً!"
4. افتح phpMyAdmin وتحقق من:
   - جدول `orders`: يجب أن يكون هناك طلب جديد
   - جدول `users`: يجب أن يكون هناك حساب جديد بالبريد الإلكتروني الذي أدخلته
   - جدول `order_items`: يجب أن تكون هناك عناصر الطلب

### 3. اختبار API مباشرة (اختياري):

#### اختبار إنشاء طلب:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 100.00
      }
    ],
    "total_amount": 200.00,
    "guest_name": "أحمد محمد",
    "guest_email": "test@example.com",
    "phone": "01234567890",
    "governorate": "القاهرة",
    "city": "مدينة نصر",
    "shipping_address": "القاهرة، مدينة نصر",
    "payment_method": "cash_on_delivery",
    "notes": "ملاحظة اختبار"
  }'
```

### 4. التحقق من قاعدة البيانات:

#### في phpMyAdmin:
```sql
-- التحقق من الطلبات
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- التحقق من المستخدمين الجدد
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- التحقق من عناصر الطلب
SELECT oi.*, p.name_ar, p.name_en 
FROM order_items oi 
LEFT JOIN products p ON oi.product_id = p.id 
ORDER BY oi.created_at DESC LIMIT 10;
```

## النتائج المتوقعة:

✅ يجب أن يتم:
1. إنشاء طلب في جدول `orders`
2. إنشاء حساب customer في جدول `users` (إذا كان الزائر)
3. إنشاء عناصر الطلب في جدول `order_items`
4. خصم الكمية من المخزون في جدول `products`
5. عرض رسالة نجاح في الواجهة

## حل المشاكل:

### إذا ظهر خطأ "المنتج غير موجود":
- تأكد من وجود منتجات في جدول `products`
- استخدم `product_id` صحيح

### إذا ظهر خطأ "الكمية غير كافية":
- تأكد من أن `stock` في جدول `products` كافٍ

### إذا لم يتم إنشاء الحساب:
- تحقق من أن `guest_email` موجود في الطلب
- تحقق من console في الـ backend للبحث عن أخطاء
