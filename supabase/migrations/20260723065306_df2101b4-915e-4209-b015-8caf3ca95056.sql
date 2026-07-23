
-- Materialized view: hot wall feed (top 500 most recent public posts)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_wall_feed_hot AS
SELECT
  p.id AS post_id,
  p.user_id AS author_id,
  p.content,
  p.created_at
FROM public.posts p
ORDER BY p.created_at DESC
LIMIT 500;

CREATE UNIQUE INDEX IF NOT EXISTS mv_wall_feed_hot_pk ON public.mv_wall_feed_hot(post_id);
CREATE INDEX IF NOT EXISTS mv_wall_feed_hot_created ON public.mv_wall_feed_hot(created_at DESC);

-- Materialized view: weekly XP top 100
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_weekly_xp_top AS
SELECT
  v.user_id,
  COUNT(*) * 5 AS weekly_xp,
  COUNT(*) AS view_count
FROM public.rewarded_ad_views v
WHERE v.created_at >= date_trunc('week', now())
GROUP BY v.user_id
ORDER BY weekly_xp DESC
LIMIT 100;

CREATE UNIQUE INDEX IF NOT EXISTS mv_weekly_xp_top_pk ON public.mv_weekly_xp_top(user_id);

-- Cached reader: wall feed (returns joined public profile fields)
CREATE OR REPLACE FUNCTION public.get_cached_wall_feed(_limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS TABLE (
  post_id uuid,
  author_id uuid,
  content text,
  created_at timestamptz,
  author_username text,
  author_full_name text,
  author_avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.post_id, f.author_id, f.content, f.created_at,
         pp.username, pp.full_name, pp.avatar_url
  FROM public.mv_wall_feed_hot f
  LEFT JOIN public.public_profiles pp ON pp.id = f.author_id
  ORDER BY f.created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 100))
  OFFSET GREATEST(0, _offset);
$$;

-- Cached reader: weekly XP leaderboard
CREATE OR REPLACE FUNCTION public.get_cached_weekly_xp_top(_limit int DEFAULT 10)
RETURNS TABLE (
  user_id uuid,
  weekly_xp bigint,
  view_count bigint,
  username text,
  full_name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.user_id, w.weekly_xp, w.view_count,
         pp.username, pp.full_name, pp.avatar_url
  FROM public.mv_weekly_xp_top w
  LEFT JOIN public.public_profiles pp ON pp.id = w.user_id
  ORDER BY w.weekly_xp DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;

-- Refresh helper (concurrent, safe for hot paths)
CREATE OR REPLACE FUNCTION public.refresh_public_cache_mvs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_wall_feed_hot;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_weekly_xp_top;
EXCEPTION WHEN OTHERS THEN
  -- Fall back to non-concurrent on first run (before uniq index exists / no data)
  REFRESH MATERIALIZED VIEW public.mv_wall_feed_hot;
  REFRESH MATERIALIZED VIEW public.mv_weekly_xp_top;
END;
$$;

-- Grants: allowlist anon + authenticated to the cached readers only.
-- The MVs themselves stay locked down (no direct GRANT).
REVOKE ALL ON FUNCTION public.get_cached_wall_feed(int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_cached_weekly_xp_top(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cached_wall_feed(int, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cached_weekly_xp_top(int) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_public_cache_mvs() FROM PUBLIC;

-- Initial populate
SELECT public.refresh_public_cache_mvs();

-- Schedule refresh every 60 seconds via pg_cron (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job WHERE jobname = 'refresh-public-cache-mvs';
    PERFORM cron.schedule(
      'refresh-public-cache-mvs',
      '* * * * *',
      $cron$ SELECT public.refresh_public_cache_mvs(); $cron$
    );
  END IF;
END $$;
