-- Add verification fields to public profile view by appending new columns at the end
-- (so PostgreSQL keeps the existing column positions and avoids rename errors).
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id,
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
    created_at,
    verification_tier,
    verification_expires_at
FROM public.profiles;

ALTER VIEW public.public_profiles SET (security_invoker = on);

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Realtime for profiles so verification status updates live in AuthContext
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
