-- Migration: Add customer_email to orders table to store user's email at checkout time

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
