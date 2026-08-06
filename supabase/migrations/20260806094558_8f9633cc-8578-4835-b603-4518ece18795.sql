CREATE OR REPLACE FUNCTION public.get_forum_reputation(_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  user_id uuid,
  posts_count integer,
  comments_count integer,
  likes_received integer,
  helpful_count integer,
  streak_days integer,
  points integer,
  badges text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_posts integer := 0;
  v_comments integer := 0;
  v_likes integer := 0;
  v_helpful integer := 0;
  v_streak integer := 0;
  v_points integer := 0;
  v_badges text[] := '{}';
BEGIN
  IF _user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*) INTO v_posts FROM public.forum_posts p
    WHERE p.user_id = _user_id AND coalesce(p.is_active, true);

  SELECT count(*) INTO v_comments FROM public.forum_comments c
    WHERE c.user_id = _user_id AND coalesce(c.is_active, true);

  SELECT count(*) INTO v_likes FROM public.forum_post_likes l
    JOIN public.forum_posts p ON p.id = l.post_id
    WHERE p.user_id = _user_id AND l.user_id <> _user_id;

  SELECT coalesce(sum(c.likes_count), 0) INTO v_helpful FROM public.forum_comments c
    WHERE c.user_id = _user_id;

  SELECT count(DISTINCT (p.created_at AT TIME ZONE 'UTC')::date) INTO v_streak
    FROM public.forum_posts p
    WHERE p.user_id = _user_id AND p.created_at > now() - interval '7 days';

  v_points := v_posts * 10 + v_comments * 3 + v_likes * 2;

  IF v_posts >= 1 THEN v_badges := v_badges || 'first_post'; END IF;
  IF v_helpful >= 10 THEN v_badges := v_badges || 'helpful_10'; END IF;
  IF v_posts >= 25 THEN v_badges := v_badges || 'posts_25'; END IF;
  IF v_streak >= 7 THEN v_badges := v_badges || 'streak_7'; END IF;
  IF v_likes >= 50 THEN v_badges := v_badges || 'likes_50'; END IF;

  RETURN QUERY SELECT _user_id, v_posts, v_comments, v_likes, v_helpful, v_streak, v_points, v_badges;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_forum_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  posts_count integer,
  comments_count integer,
  likes_received integer,
  points integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH p AS (
    SELECT fp.user_id, count(*)::int AS posts
    FROM public.forum_posts fp
    WHERE coalesce(fp.is_active, true)
    GROUP BY fp.user_id
  ),
  c AS (
    SELECT fc.user_id, count(*)::int AS comments
    FROM public.forum_comments fc
    WHERE coalesce(fc.is_active, true)
    GROUP BY fc.user_id
  ),
  l AS (
    SELECT fp.user_id, count(*)::int AS likes
    FROM public.forum_post_likes fl
    JOIN public.forum_posts fp ON fp.id = fl.post_id
    WHERE fl.user_id <> fp.user_id
    GROUP BY fp.user_id
  ),
  u AS (
    SELECT user_id FROM p
    UNION SELECT user_id FROM c
    UNION SELECT user_id FROM l
  )
  SELECT
    u.user_id,
    pr.full_name,
    pr.avatar_url,
    coalesce(p.posts, 0),
    coalesce(c.comments, 0),
    coalesce(l.likes, 0),
    (coalesce(p.posts, 0) * 10 + coalesce(c.comments, 0) * 3 + coalesce(l.likes, 0) * 2)::int AS points
  FROM u
  LEFT JOIN p ON p.user_id = u.user_id
  LEFT JOIN c ON c.user_id = u.user_id
  LEFT JOIN l ON l.user_id = u.user_id
  LEFT JOIN public.profiles pr ON pr.id = u.user_id
  ORDER BY points DESC
  LIMIT greatest(1, least(coalesce(_limit, 20), 100));
$$;

REVOKE EXECUTE ON FUNCTION public.get_forum_reputation(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_forum_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_forum_reputation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_forum_leaderboard(integer) TO authenticated, anon;