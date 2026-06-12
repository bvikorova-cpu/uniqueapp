DROP VIEW IF EXISTS public.profiles_public CASCADE;
CREATE VIEW public.profiles_public AS
SELECT
  id, full_name, username, avatar_url, avatar_3d_url, animated_avatar_url,
  cover_url, banner_url, headline, bio, location, website, occupation,
  company, company_name, user_type, is_verified, rating_average, total_reviews,
  completed_exchanges, theme_color, accent_color, profile_theme, interests,
  skills, skills_offered, skills_wanted, languages, social_links, open_to_work,
  open_to_work_details, profile_music_url, profile_music_title,
  seo_title, seo_description, created_at
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;
COMMENT ON VIEW public.profiles_public IS 'Compatibility alias for public_profiles. Prefer public_profiles in new code.';