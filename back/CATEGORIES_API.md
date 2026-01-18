# API الأقسام (Categories)

## Endpoints المتاحة

### 1. جلب جميع الأقسام (Public)
```
GET /api/categories
```
**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "1",
        "nameAr": "مكملات بروتين",
        "nameEn": "Protein Supplements",
        "image": "/images/1.webp",
        "slug": "proteins",
        "isActive": true
      }
    ]
  }
}
```

### 2. جلب قسم محدد
```
GET /api/categories/:id
```

### 3. إنشاء قسم جديد (Admin Only)
```
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "مكملات بروتين",
  "name_en": "Protein Supplements",
  "description": "وصف القسم",
  "image_url": "/images/1.webp",
  "is_active": true
}
```

### 4. تحديث قسم (Admin Only)
```
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "اسم محدث",
  "name_en": "Updated Name",
  "description": "وصف محدث",
  "image_url": "/images/updated.webp",
  "is_active": true
}
```

### 5. تعطيل/تفعيل قسم (Admin Only)
```
PUT /api/categories/:id/toggle-status
Authorization: Bearer <token>
```

### 6. حذف قسم (Admin Only)
```
DELETE /api/categories/:id
Authorization: Bearer <token>
```

### 7. جلب جميع الأقسام (بما فيها المعطلة) - Admin Only
```
GET /api/categories/admin/all
Authorization: Bearer <token>
```

## ملاحظات

- الأقسام النشطة فقط (`is_active = true`) تُعرض في الـ public routes
- الـ slug يتم توليده تلقائياً من `name_en` أو `name`
- لا يمكن حذف قسم يحتوي على منتجات
- جميع العمليات محمية بـ Admin Authentication

## تحديث قاعدة البيانات

تأكد من تشغيل:
```sql
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_slug ON categories(slug);
```
