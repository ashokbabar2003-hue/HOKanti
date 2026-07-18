-- Migration: Add foreign key and indexes for coupons and orders integrity
-- Establish referential integrity between orders and coupons

-- 1. Ensure orders.coupon_id is of uuid type (it may have been added as text in an earlier migration)
ALTER TABLE orders 
  ALTER COLUMN coupon_id TYPE uuid USING NULLIF(coupon_id, '')::uuid;

-- 2. Add Foreign Key Constraint with referential integrity (ON DELETE SET NULL)
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS fk_orders_coupon_id,
  ADD CONSTRAINT fk_orders_coupon_id 
    FOREIGN KEY (coupon_id) 
    REFERENCES coupons(id) 
    ON DELETE SET NULL;

-- 3. Create necessary performance indexes for orders and coupons search/validation
-- Index on orders.coupon_id for fast foreign key lookups and analytics
CREATE INDEX IF NOT EXISTS orders_coupon_id_idx ON orders (coupon_id);

-- Index on orders.created_at for sorting Order History fast
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- Index on orders.user_id for loading a customer's specific Order History fast
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);

-- Index on coupons.created_at for sorting Admin Coupon List fast
CREATE INDEX IF NOT EXISTS coupons_created_at_idx ON coupons (created_at DESC);
