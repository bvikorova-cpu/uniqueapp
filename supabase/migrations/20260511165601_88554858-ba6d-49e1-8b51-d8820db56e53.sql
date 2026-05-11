CREATE OR REPLACE FUNCTION public.get_iq_country_leaderboard()
RETURNS TABLE (
  rank BIGINT,
  country_code TEXT,
  player_count BIGINT,
  avg_best_iq NUMERIC,
  top_iq INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      COALESCE(s.country_code, 'XX') AS country_code,
      COUNT(*)::BIGINT               AS player_count,
      ROUND(AVG(s.best_iq)::NUMERIC, 1) AS avg_best_iq,
      MAX(s.best_iq)::INT            AS top_iq
    FROM public.iq_user_stats s
    WHERE s.best_iq IS NOT NULL AND s.best_iq > 0
    GROUP BY COALESCE(s.country_code, 'XX')
    HAVING COUNT(*) >= 1
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY avg_best_iq DESC, top_iq DESC) AS rank,
    country_code,
    player_count,
    avg_best_iq,
    top_iq
  FROM agg
  ORDER BY rank
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_country_leaderboard() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_iq_country_top_players(_country_code TEXT, _limit INT DEFAULT 25)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  share_slug TEXT,
  best_iq INT,
  tier TEXT,
  total_tests INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY s.best_iq DESC, s.total_tests DESC) AS rank,
    s.user_id,
    p.display_name,
    p.avatar_url,
    p.share_slug,
    s.best_iq,
    s.tier,
    s.total_tests
  FROM public.iq_user_stats s
  JOIN public.iq_public_profiles p ON p.user_id = s.user_id
  WHERE p.is_public = TRUE
    AND COALESCE(s.country_code, 'XX') = COALESCE(_country_code, 'XX')
    AND s.best_iq IS NOT NULL
  ORDER BY rank
  LIMIT GREATEST(LEAST(_limit, 100), 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_country_top_players(TEXT, INT) TO anon, authenticated;
