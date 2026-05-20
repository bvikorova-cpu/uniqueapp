
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
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

-- The view uses security_invoker=true, but profiles RLS now restricts non-owners.
-- Add an additional permissive SELECT policy on profiles that allows reading
-- of any row but only when accessed through the public view's safe column set.
-- Simpler: add a permissive SELECT policy for authenticated/anon to allow row
-- visibility; column protection is enforced by the view's projection (callers
-- using the view only see safe columns; direct profiles table access remains
-- owner-only because there's no other SELECT policy granting access).

-- To make the view actually return rows for other users, grant a row-visibility
-- policy targeted at the view path. Easiest: add policy allowing any authenticated
-- user to SELECT, but REVOKE direct table SELECT from authenticated/anon roles
-- so only the view (running as invoker with table-level grant) can be used.
-- Since we cannot make the view bypass RLS with security_invoker=true and the
-- caller has no SELECT policy granting non-owner rows, we switch approach:

-- Add a permissive policy that grants row visibility for the public view's
-- intended use: any authenticated user can see any row, but ONLY safe columns
-- are exposed via the view. Direct table SELECT * by non-owners will still
-- return rows BUT the sensitive columns would then be readable too — which is
-- exactly the original problem.

-- Correct solution: keep RLS owner-only, switch the view to SECURITY DEFINER
-- semantics by making it owned by a role that has table SELECT, and revoke
-- direct table SELECT from authenticated/anon. Postgres views run with the
-- privileges of the view owner by default (security_invoker=false), which is
-- what we want here for cross-user reads of safe columns only.

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = false)
AS
SELECT
  id, username, full_name, avatar_url, avatar_3d_url, animated_avatar_url,
  cover_url, banner_url, bio, headline, location, website, occupation,
  company, company_name, user_type, interests, skills, skills_offered,
  skills_wanted, languages, social_links, rating_average, total_reviews,
  completed_exchanges, is_verified, theme_color, accent_color, profile_theme,
  open_to_work, open_to_work_details, profile_music_url, profile_music_title,
  seo_title, seo_description, created_at
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC;
GRANT SELECT ON public.public_profiles TO authenticated, anon;
