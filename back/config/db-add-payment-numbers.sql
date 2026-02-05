-- Add InstaPay and FawryCash number columns to site_settings table
USE king_of_muscles;

-- Add instapay_number column
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS instapay_number VARCHAR(50) NULL COMMENT 'رقم انستا باي للتحويل';

-- Add fawrycash_number column  
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS fawrycash_number VARCHAR(50) NULL COMMENT 'رقم فوري كاش للتحويل';

-- Verify columns were added
DESCRIBE site_settings;
