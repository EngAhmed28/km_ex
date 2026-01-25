-- إعادة تعيين كلمة المرور لمستخدم
-- استبدل 'user@example.com' بالبريد الإلكتروني الخاص بك
-- واستبدل 'NewPassword123' بكلمة المرور الجديدة التي تريدها

-- كلمة المرور الجديدة: NewPassword123
-- (سيتم تشفيرها تلقائياً)

UPDATE users 
SET password = '$2a$10$rK8X8X8X8X8X8X8X8X8Xe8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X' 
WHERE email = 'user@example.com';

-- ملاحظة: هذا hash لكلمة المرور "NewPassword123"
-- إذا أردت كلمة مرور مختلفة، استخدم هذا الموقع لتوليد hash:
-- https://bcrypt-generator.com/
-- أو استخدم Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('YourPassword', 10);
-- console.log(hash);
