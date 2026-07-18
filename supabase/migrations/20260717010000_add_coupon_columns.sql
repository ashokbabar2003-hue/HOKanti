-- Add coupon columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS coupon_id text,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount numeric DEFAULT 0;
