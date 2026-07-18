-- Add email tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS customer_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS admin_email_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS email_error text;
