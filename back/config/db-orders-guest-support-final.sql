-- الخطوة 1: جعل user_id nullable
ALTER TABLE orders MODIFY COLUMN user_id INT NULL;

-- الخطوة 2: إضافة حقول للزوار
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) NULL;
ALTER TABLE orders ADD COLUMN governorate VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN city VARCHAR(100) NULL;

-- الخطوة 3: إعادة إنشاء foreign key constraint
ALTER TABLE orders 
  ADD CONSTRAINT orders_ibfk_user 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- الخطوة 4: إضافة index للبريد الإلكتروني
CREATE INDEX idx_guest_email ON orders(guest_email);
