CREATE OR REPLACE FUNCTION public.get_my_friends()
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.id, p.full_name, p.username, p.avatar_url
  FROM public.friendships f
  JOIN public.profiles p
    ON p.id = CASE WHEN f.user_id = auth.uid() THEN f.friend_id ELSE f.user_id END
  WHERE f.status = 'accepted'
    AND (f.user_id = auth.uid() OR f.friend_id = auth.uid())
    AND auth.uid() IS NOT NULL
  ORDER BY p.full_name NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_my_friends() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_friends() TO service_role;