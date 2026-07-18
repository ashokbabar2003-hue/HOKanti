-- Add theme_preference column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'classic-kanti';
