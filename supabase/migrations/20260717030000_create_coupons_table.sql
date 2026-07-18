-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  discount_type text NOT NULL, -- 'PERCENTAGE', 'FIXED', 'FINAL_PRICE'
  discount_value numeric(10,2) NOT NULL,
  minimum_order numeric(10,2) DEFAULT 0,
  maximum_discount numeric(10,2),
  final_price numeric(10,2),
  free_shipping boolean DEFAULT false,
  is_active boolean DEFAULT true,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure all requested columns are in orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_id uuid,
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS coupon_type text,
ADD COLUMN IF NOT EXISTS coupon_value numeric(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2),
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS customer_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS admin_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_error text,
ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz;

-- Create an index on coupon code for case-insensitive lookup
CREATE INDEX IF NOT EXISTS coupons_code_lower_idx ON coupons (lower(code));

-- Enable RLS on coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to coupons
CREATE POLICY "Allow public read on coupons" ON coupons
  FOR SELECT TO public USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on coupons" ON coupons
  FOR ALL USING (auth.role() = 'service_role');

-- Seed default coupons if they don't already exist
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, is_active)
VALUES 
  ('WELCOME99', 'Welcome Coupon', '99% off for new customers', 'PERCENTAGE', 99.00, 0.00, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, final_price, is_active)
VALUES 
  ('HOKTEST', 'Testing Coupon', 'Sets total payable amount to exactly 1 Rupee', 'FINAL_PRICE', 0.00, 0.00, 1.00, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, is_active)
VALUES 
  ('FIRSTORDER', 'First Order', '10% off on your first purchase', 'PERCENTAGE', 10.00, 0.00, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, is_active)
VALUES 
  ('DIWALI25', 'Diwali Special', '25% celebration discount', 'PERCENTAGE', 25.00, 0.00, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, free_shipping, is_active)
VALUES 
  ('FREESHIP', 'Free Shipping', 'Free delivery on your order', 'PERCENTAGE', 0.00, 0.00, true, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_order, is_active)
VALUES 
  ('SAVE500', 'Save 500', 'Flat 500 discount on orders above 1000', 'FIXED', 500.00, 1000.00, true)
ON CONFLICT (code) DO NOTHING;

