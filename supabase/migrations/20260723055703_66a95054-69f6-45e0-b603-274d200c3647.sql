
DROP POLICY IF EXISTS "Anon can view public profile verification status" ON public.profiles;

DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  id,
  username,
  full_name,
  avatar_url,
  cover_url,
  banner_url,
  bio,
  headline,
  occupation,
  location,
  is_verified,
  verification_tier,
  verification_expires_at,
  rating_average,
  total_reviews,
  user_type,
  theme_color,
  accent_color,
  profile_theme,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
