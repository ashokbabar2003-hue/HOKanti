-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Disable public access by default. Since all inserts occur through the 
-- backend server using the Supabase Service Role (which bypasses RLS),
-- we DO NOT need public insert permissions on this table.
-- This prevents direct database access or spam injection bypassing our Turnstile / Rate-limiting server.

-- Allow admins/service role to read and modify all messages
CREATE POLICY "Allow service role full access" ON public.contact_messages
  FOR ALL USING (auth.role() = 'service_role');
