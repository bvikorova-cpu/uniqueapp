
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
  avatar_3d_url,
  animated_avatar_url,
  bio,
  headline,
  occupation,
  company,
  company_name,
  location,
  website,
  interests,
  skills,
  skills_offered,
  skills_wanted,
  languages,
  social_links,
  open_to_work,
  open_to_work_details,
  profile_music_url,
  profile_music_title,
  is_verified,
  verification_tier,
  verification_expires_at,
  rating_average,
  total_reviews,
  completed_exchanges,
  user_type,
  theme_color,
  accent_color,
  profile_theme,
  personality_traits,
  tone_of_voice,
  seo_title,
  seo_description,
  preferred_language,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
