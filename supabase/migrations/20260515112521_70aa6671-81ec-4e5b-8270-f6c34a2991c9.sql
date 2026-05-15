
-- 1. suggest_friends: restrict to caller's own user_id
CREATE OR REPLACE FUNCTION public.suggest_friends(_user_id uuid, _limit integer DEFAULT 10)
 RETURNS TABLE(suggested_id uuid, mutual_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR _user_id IS NULL OR _user_id <> auth.uid() THEN
    RETURN;
  END IF;
  RETURN QUERY
  WITH my_friends AS (
    SELECT CASE WHEN user_id = _user_id THEN friend_id ELSE user_id END AS fid
    FROM public.friendships
    WHERE status = 'accepted' AND (user_id = _user_id OR friend_id = _user_id)
  ),
  fof AS (
    SELECT
      CASE WHEN f.user_id = mf.fid THEN f.friend_id ELSE f.user_id END AS candidate
    FROM public.friendships f
    JOIN my_friends mf ON (f.user_id = mf.fid OR f.friend_id = mf.fid)
    WHERE f.status = 'accepted'
  )
  SELECT candidate AS suggested_id, COUNT(*) AS mutual_count
  FROM fof
  WHERE candidate <> _user_id
    AND candidate NOT IN (SELECT fid FROM my_friends)
    AND NOT EXISTS (
      SELECT 1 FROM public.friendships f2
      WHERE (f2.user_id = _user_id AND f2.friend_id = candidate)
         OR (f2.user_id = candidate AND f2.friend_id = _user_id)
    )
  GROUP BY candidate
  ORDER BY mutual_count DESC
  LIMIT _limit;
END;
$function$;

-- 2. get_iq_progress: restrict to caller's own data only
CREATE OR REPLACE FUNCTION public.get_iq_progress(_user uuid DEFAULT NULL::uuid)
 RETURNS TABLE(completed_at timestamp with time zone, iq_score integer, percentile numeric, category text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _target uuid := COALESCE(_user, auth.uid());
BEGIN
  IF auth.uid() IS NULL OR _target <> auth.uid() THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT r.completed_at, r.iq_score, r.percentile, r.category
  FROM iq_test_results r
  WHERE r.user_id = _target
  ORDER BY r.completed_at DESC
  LIMIT 30;
END;
$function$;

-- 3. get_post_memories: restrict to caller's own posts
CREATE OR REPLACE FUNCTION public.get_post_memories(_user_id uuid, _limit integer DEFAULT 10)
 RETURNS SETOF posts
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR _user_id IS NULL OR _user_id <> auth.uid() THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT *
  FROM public.posts
  WHERE user_id = _user_id
    AND created_at < date_trunc('day', now())
    AND extract(month from created_at) = extract(month from now())
    AND extract(day   from created_at) = extract(day   from now())
  ORDER BY created_at DESC
  LIMIT _limit;
END;
$function$;
