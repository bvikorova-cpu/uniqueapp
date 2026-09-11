CREATE OR REPLACE FUNCTION public.get_user_friends_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(DISTINCT CASE WHEN f.user_id = _user_id THEN f.friend_id ELSE f.user_id END)::int
  FROM public.friendships f
  WHERE f.status = 'accepted'
    AND (f.user_id = _user_id OR f.friend_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_user_friends(_user_id uuid)
RETURNS TABLE (id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id IN (
    SELECT DISTINCT CASE WHEN f.user_id = _user_id THEN f.friend_id ELSE f.user_id END
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (f.user_id = _user_id OR f.friend_id = _user_id)
  )
  ORDER BY p.full_name NULLS LAST;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_friends_count(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_friends(uuid) TO anon, authenticated, service_role;