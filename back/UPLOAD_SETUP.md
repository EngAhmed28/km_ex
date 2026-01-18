# إعداد رفع الصور

## الخطوات المطلوبة

### 1. تثبيت multer
```bash
cd back
npm install multer
```

### 2. إنشاء مجلد uploads
سيتم إنشاء المجلد تلقائياً عند رفع أول صورة:
- `back/uploads/categories/` - صور الأقسام

### 3. التأكد من أن السيرفر يخدم الملفات الثابتة
تم إضافة في `server.js`:
```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### 4. Validation في الفرونت إند
- نوع الملف: JPG, PNG, WEBP, GIF فقط
- الحجم: الحد الأقصى 5 ميجابايت
- معاينة الصورة قبل الرفع

### 5. API Endpoint
```
POST /api/upload/category
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: [file]
```

### 6. Response
```json
{
  "success": true,
  "message": "تم رفع الصورة بنجاح",
  "data": {
    "url": "/uploads/categories/category-1234567890.jpg",
    "filename": "category-1234567890.jpg"
  }
}
```

## ملاحظات
- الصور تُحفظ في `back/uploads/categories/`
- الأسماء فريدة باستخدام timestamp + random number
- فقط Admin يمكنه رفع الصور
- Validation على نوع الملف والحجم
