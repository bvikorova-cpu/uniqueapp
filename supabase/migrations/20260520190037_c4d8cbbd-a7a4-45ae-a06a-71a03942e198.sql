
-- 1. Lock down profiles: drop broad authenticated SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Owner-only SELECT remains via existing "Users can view own full profile" policy.

-- 2. Create a public-safe view exposing only non-sensitive display fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  username,
  full_name,
  display_name_alias.display_name,
  avatar_url,
  avatar_3d_url,
  animated_avatar_url,
  cover_url,
  banner_url,
  bio,
  headline,
  location,
  website,
  occupation,
  company,
  company_name,
  user_type,
  interests,
  skills,
  skills_offered,
  skills_wanted,
  languages,
  social_links,
  rating_average,
  total_reviews,
  completed_exchanges,
  is_verified,
  theme_color,
  accent_color,
  profile_theme,
  open_to_work,
  open_to_work_details,
  profile_music_url,
  profile_music_title,
  seo_title,
  seo_description,
  created_at
FROM public.profiles
LEFT JOIN LATERAL (SELECT NULL::text AS display_name) display_name_alias ON true;

-- Simpler view without the lateral hack (drop and recreate cleanly)
DROP VIEW public.public_profiles;

CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
  id,
  username,
  full_name,
  avatar_url,
  avatar_3d_url,
  animated_avatar_url,
  cover_url,
  banner_url,
  bio,
  headline,
  location,
  website,
  occupation,
  company,
  company_name,
  user_type,
  interests,
  skills,
  skills_offered,
  skills_wanted,
  languages,
  social_links,
  rating_average,
  total_reviews,
  completed_exchanges,
  is_verified,
  theme_color,
  accent_color,
  profile_theme,
  open_to_work,
  open_to_work_details,
  profile_music_url,
  profile_music_title,
  seo_title,
  seo_description,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- 3. Lock down ai_credit_promo_codes: drop broad SELECT, admin-only
DROP POLICY IF EXISTS "Authenticated read active codes" ON public.ai_credit_promo_codes;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_credit_promo_codes'
      AND policyname = 'Admins can view all promo codes'
  ) THEN
    CREATE POLICY "Admins can view all promo codes"
      ON public.ai_credit_promo_codes
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
