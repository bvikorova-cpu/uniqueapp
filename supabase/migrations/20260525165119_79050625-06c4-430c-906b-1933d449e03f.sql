
-- Public-safe view of profiles for cross-user lookups (search, mentions, lists).
-- Uses security_invoker=off so the view bypasses base table RLS and exposes
-- only non-sensitive columns. Sensitive fields (email, phone, iban, stripe_*,
-- signup_ip, signup_user_agent) stay protected by base table RLS.
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = off) AS
SELECT
  id,
  full_name,
  username,
  avatar_url,
  avatar_3d_url,
  animated_avatar_url,
  cover_url,
  banner_url,
  headline,
  bio,
  location,
  occupation,
  company,
  user_type,
  is_verified,
  rating_average,
  total_reviews,
  completed_exchanges,
  theme_color,
  accent_color,
  profile_theme,
  interests,
  languages,
  skills_offered,
  skills_wanted,
  open_to_work,
  seo_title,
  seo_description,
  created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Server-side search for users (safe fields only)
CREATE OR REPLACE FUNCTION public.search_users(q text, lim int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  headline text,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, username, avatar_url, headline, is_verified
  FROM public.profiles
  WHERE q IS NOT NULL
    AND length(trim(q)) > 0
    AND (
      full_name ILIKE '%' || q || '%'
      OR username ILIKE '%' || q || '%'
    )
  ORDER BY is_verified DESC NULLS LAST, full_name ASC
  LIMIT GREATEST(1, LEAST(coalesce(lim, 20), 50));
$$;

GRANT EXECUTE ON FUNCTION public.search_users(text, int) TO anon, authenticated;
