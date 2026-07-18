-- Add user_id column to contact_messages table
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS user_id UUID;
