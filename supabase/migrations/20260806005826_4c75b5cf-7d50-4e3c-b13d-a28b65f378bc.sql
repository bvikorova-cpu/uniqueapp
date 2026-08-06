CREATE OR REPLACE FUNCTION public.get_my_friends()
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.username, p.avatar_url
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.friend_id
  WHERE f.user_id = auth.uid() AND f.status = 'accepted'
  UNION ALL
  SELECT p.id, p.full_name, p.username, p.avatar_url
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.user_id
  WHERE f.friend_id = auth.uid() AND f.status = 'accepted'
  ORDER BY full_name NULLS LAST;
$$;

-- Ensure grants are preserved for the replaced function.
GRANT EXECUTE ON FUNCTION public.get_my_friends() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_friends() TO service_role;

-- Optional: add a covering index on the reverse lookup if the planner ever needs it.
-- Existing indexes (idx_friendships_user_status, idx_friendships_friend_status) already cover it.
