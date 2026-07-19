-- Migration: Fix order_items RLS recursion scoping bug by removing explicit table qualification in EXISTS subquery

-- 1. Drop existing policies on order_items
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;

-- 2. Re-create policies with unqualified order_id to prevent recursive table scan / RLS recursion error
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
