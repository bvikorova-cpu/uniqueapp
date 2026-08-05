ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS education text,
  ADD COLUMN IF NOT EXISTS relationship_goal text,
  ADD COLUMN IF NOT EXISTS kids text,
  ADD COLUMN IF NOT EXISTS pets text,
  ADD COLUMN IF NOT EXISTS smoking text,
  ADD COLUMN IF NOT EXISTS drinking text,
  ADD COLUMN IF NOT EXISTS exercise text,
  ADD COLUMN IF NOT EXISTS diet text,
  ADD COLUMN IF NOT EXISTS languages text[],
  ADD COLUMN IF NOT EXISTS zodiac text,
  ADD COLUMN IF NOT EXISTS personality_type text,
  ADD COLUMN IF NOT EXISTS music_taste text,
  ADD COLUMN IF NOT EXISTS favorite_movies text,
  ADD COLUMN IF NOT EXISTS favorite_books text,
  ADD COLUMN IF NOT EXISTS travel_style text,
  ADD COLUMN IF NOT EXISTS favorite_quote text;

CREATE OR REPLACE VIEW public.dating_profiles_browse AS
 SELECT id, user_id, display_name, bio, age, gender, looking_for, location,
    profile_photo_url, additional_photos, interests, is_active, created_at, updated_at,
    prompts, voice_intro_url, voice_intro_duration, spotify_url, instagram_url,
    photo_verified, compatibility_quiz, opening_move, passport_location,
    read_receipts_enabled, video_prompts,
    height_cm, job_title, company, education, relationship_goal, kids, pets,
    smoking, drinking, exercise, diet, languages, zodiac, personality_type,
    music_taste, favorite_movies, favorite_books, travel_style, favorite_quote
   FROM dating_profiles
  WHERE is_active = true AND COALESCE(incognito, false) = false AND COALESCE(is_shadow_banned, false) = false;

GRANT SELECT ON public.dating_profiles_browse TO authenticated, anon;