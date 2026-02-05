-- Add sales_count column to products table for tracking best selling products
USE king_of_muscles;

-- Add sales_count column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sales_count INT DEFAULT 0 COMMENT 'عدد المبيعات';

-- Create index for better performance when sorting by sales
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON products(sales_count DESC);

-- Verify column was added
DESCRIBE products;
