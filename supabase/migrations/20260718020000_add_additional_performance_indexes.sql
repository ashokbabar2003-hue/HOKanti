-- Migration: Add additional performance indexes for orders lookup
-- Speed up queries by razorpay_order_id during webhooks
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders (razorpay_order_id);

-- Speed up filtering by payment_status in dashboard and analytics
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
