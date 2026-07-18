-- Migration: Add webhook logs, payment_verified_at, and order payment confirmation atomic function
-- 1. Add payment_verified_at to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz;

-- 2. Create razorpay_webhook_logs table
CREATE TABLE IF NOT EXISTS razorpay_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE,
  event_type text NOT NULL,
  received_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL, -- 'success', 'failed', 'ignored', 'skipped'
  error_message text,
  payload_hash text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  payment_id text,
  processing_time_ms integer
);

-- 3. Add index on event_id for fast duplicate checks
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id ON razorpay_webhook_logs(event_id);

-- 4. Create atomic order confirmation function with row locking (FOR UPDATE)
CREATE OR REPLACE FUNCTION confirm_order_payment(
  p_order_id uuid,
  p_payment_id text,
  p_signature text,
  p_verified_at timestamptz DEFAULT now()
)
RETURNS json AS $$
DECLARE
  v_order_status text;
  v_payment_status text;
  v_coupon_id uuid;
BEGIN
  -- Select and lock the order row
  SELECT status, payment_status, coupon_id
  INTO v_order_status, v_payment_status, v_coupon_id
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'order_not_found');
  END IF;

  -- If already paid, return skipped
  IF v_payment_status = 'paid' THEN
    RETURN json_build_object('success', true, 'status', 'already_paid');
  END IF;

  -- Update order
  UPDATE orders
  SET 
    payment_status = 'paid',
    status = 'confirmed',
    razorpay_payment_id = p_payment_id,
    razorpay_signature = p_signature,
    payment_verified_at = p_verified_at,
    updated_at = now()
  WHERE id = p_order_id;

  -- Increment coupon usage count if present
  IF v_coupon_id IS NOT NULL THEN
    UPDATE coupons
    SET 
      usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = now()
    WHERE id = v_coupon_id;
  END IF;

  RETURN json_build_object('success', true, 'status', 'processed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
