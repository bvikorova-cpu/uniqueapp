-- Fix view from Wave A to use security_invoker
ALTER VIEW public.confessions_public SET (security_invoker = true);

-- ============================================================
-- 6) profiles: restrict open SELECT, expose safe public view
-- ============================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own full profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.public_profiles_safe
WITH (security_invoker = true) AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  website,
  interests,
  occupation,
  company,
  social_links,
  user_type,
  company_name,
  skills_offered,
  skills_wanted,
  rating_average,
  total_reviews,
  completed_exchanges,
  is_verified,
  theme_color,
  avatar_3d_url,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles_safe TO authenticated, anon;

-- ============================================================
-- 7+8) psychology: remove from realtime publication
-- (anonymous session-token model means RLS scoping by user_id is not possible;
--  realtime removal at least prevents mass channel subscription leaks)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='psychology_sessions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.psychology_sessions';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='psychology_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.psychology_messages';
  END IF;
END $$;

COMMENT ON TABLE public.psychology_sessions IS
  'Anonymous session-token model. Reads should be migrated to an edge function that validates the session_token server-side to fully secure access.';
COMMENT ON TABLE public.psychology_messages IS
  'Anonymous session-token model. Reads should be migrated to an edge function that validates the parent session_token server-side.';

-- ============================================================
-- 9) business_orders: hide customer phone/email from business owners
-- ============================================================
DROP POLICY IF EXISTS "Business owners can view their orders" ON public.business_orders;

CREATE OR REPLACE VIEW public.business_orders_owner_view
WITH (security_invoker = true) AS
SELECT
  bo.id,
  bo.business_id,
  bo.customer_id,
  bo.customer_name,
  bo.items,
  bo.total_amount,
  bo.status,
  bo.payment_method,
  bo.pickup_time,
  bo.notes,
  bo.created_at,
  bo.updated_at
FROM public.business_orders bo
WHERE EXISTS (
  SELECT 1 FROM public.businesses b
  WHERE b.id = bo.business_id AND b.owner_id = auth.uid()
);

GRANT SELECT ON public.business_orders_owner_view TO authenticated;
