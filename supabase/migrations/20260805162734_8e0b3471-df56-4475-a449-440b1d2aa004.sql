CREATE OR REPLACE FUNCTION public.get_dating_likes_you()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  age integer,
  gender text,
  looking_for text,
  bio text,
  location text,
  profile_photo_url text,
  additional_photos text[],
  interests text[],
  liked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.age, p.gender, p.looking_for, p.bio, p.location,
         p.profile_photo_url, p.additional_photos, p.interests, s.created_at
  FROM public.dating_swipes s
  JOIN public.dating_profiles p ON p.user_id = s.swiper_id
  WHERE s.swiped_id = auth.uid()
    AND s.action = 'like'
    AND p.is_active = true
    AND COALESCE(p.is_shadow_banned, false) = false
    AND NOT EXISTS (
      SELECT 1 FROM public.dating_swipes mine
      WHERE mine.swiper_id = auth.uid() AND mine.swiped_id = s.swiper_id
    )
  ORDER BY s.created_at DESC
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.get_dating_likes_you() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_dating_likes_you() TO authenticated;