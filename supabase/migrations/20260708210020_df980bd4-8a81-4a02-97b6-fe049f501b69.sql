CREATE OR REPLACE FUNCTION public.get_demo_dating_profiles(_limit int DEFAULT 8)
RETURNS TABLE (
  id uuid,
  display_name text,
  age int,
  gender text,
  location text,
  profile_photo_url text,
  bio text,
  interests text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, display_name, age, gender, location, profile_photo_url, bio, interests
  FROM public.dating_profiles
  WHERE bio LIKE '%[seed:v1]%'
    AND is_active = true
    AND COALESCE(is_shadow_banned, false) = false
    AND profile_photo_url IS NOT NULL
  ORDER BY id
  LIMIT GREATEST(1, LEAST(_limit, 24));
$$;

GRANT EXECUTE ON FUNCTION public.get_demo_dating_profiles(int) TO anon, authenticated;