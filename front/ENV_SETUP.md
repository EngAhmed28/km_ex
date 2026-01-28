# إعداد متغيرات البيئة - Environment Variables

## نظرة عامة

التطبيق يعمل تلقائياً على:
- **Localhost (التطوير)**: `http://localhost:5000/api`
- **Production (الإنتاج)**: `https://kingofmuscles.metacodecx.com/api`

## الكشف التلقائي

التطبيق يكتشف البيئة تلقائياً بناءً على:
- `import.meta.env.DEV` (في Vite)
- `window.location.hostname` (localhost أو 127.0.0.1)

## إعداد يدوي (اختياري)

إذا أردت تحديد URL يدوياً، أنشئ ملف `.env.local` في مجلد `front/`:

### للتطوير المحلي (Localhost):
```env
VITE_API_URL=http://localhost:5000/api
VITE_IMAGE_URL=http://localhost:5000
```

### للإنتاج (Production):
```env
VITE_API_URL=https://kingofmuscles.metacodecx.com/api
VITE_IMAGE_URL=https://kingofmuscles.metacodecx.com
```

## استخدام الدوال المساعدة

في أي ملف، يمكنك استخدام:

```javascript
import { getApiBaseUrl, getImageBaseUrl, getFullUrl } from '../utils/api';

// للحصول على API URL
const apiUrl = getApiBaseUrl(); // http://localhost:5000/api أو https://...

// للحصول على Image URL
const imageUrl = getImageBaseUrl(); // http://localhost:5000 أو https://...

// للحصول على URL كامل لصورة أو مسار
const fullImageUrl = getFullUrl('/uploads/image.jpg');
```

## ملاحظات

- ملفات `.env.local` و `.env.production` محمية في `.gitignore`
- لا تقم برفع ملفات `.env` إلى Git
- التطبيق يعمل تلقائياً بدون إعداد إضافي
