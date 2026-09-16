CREATE OR REPLACE FUNCTION public.people_you_may_know(_limit integer DEFAULT 8)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, mutual_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH edges AS (
    SELECT f.user_id AS a, f.friend_id AS b, f.status FROM public.friendships f
    UNION ALL
    SELECT f.friend_id AS a, f.user_id AS b, f.status FROM public.friendships f
  ),
  linked AS (
    SELECT b AS uid FROM edges WHERE a = v_me
    UNION SELECT v_me
  ),
  my_friends AS (
    SELECT b AS uid FROM edges WHERE a = v_me AND status = 'accepted'
  ),
  fof AS (
    SELECT e.b AS cand, count(*)::bigint AS mutuals
    FROM edges e
    JOIN my_friends mf ON mf.uid = e.a
    WHERE e.status = 'accepted'
      AND e.b NOT IN (SELECT uid FROM linked)
    GROUP BY e.b
  ),
  picked AS (
    SELECT cand, mutuals FROM fof
    UNION ALL
    SELECT p.id, 0::bigint
    FROM public.profiles p
    WHERE NOT EXISTS (SELECT 1 FROM fof)
      AND p.id NOT IN (SELECT uid FROM linked)
    ORDER BY 2 DESC
    LIMIT GREATEST(_limit, 1)
  )
  SELECT p.id, p.full_name, p.username, p.avatar_url, k.mutuals
  FROM picked k
  JOIN public.profiles p ON p.id = k.cand
  ORDER BY k.mutuals DESC
  LIMIT GREATEST(_limit, 1);
END;
$$;

REVOKE ALL ON FUNCTION public.people_you_may_know(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.people_you_may_know(integer) TO authenticated;