CREATE OR REPLACE FUNCTION public.get_iq_leaderboard(_limit INT DEFAULT 50)
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
    ROW_NUMBER() OVER (ORDER BY s.best_iq DESC NULLS LAST) AS rank,
    s.user_id,
    p.display_name,
    p.avatar_url,
    p.share_slug,
    s.best_iq,
    s.tier,
    s.total_tests
  FROM public.iq_user_stats s
  JOIN public.iq_public_profiles p ON p.user_id = s.user_id
  WHERE p.is_public = true AND s.best_iq IS NOT NULL
  ORDER BY s.best_iq DESC NULLS LAST
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_leaderboard(INT) TO anon, authenticated;