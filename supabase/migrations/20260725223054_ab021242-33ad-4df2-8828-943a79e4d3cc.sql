
CREATE OR REPLACE FUNCTION public.top_games(_period text DEFAULT 'week', _category text DEFAULT NULL, _limit int DEFAULT 10)
RETURNS TABLE(game_id text, game_title text, game_category text, plays bigint, players bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    gp.game_id,
    (array_agg(gp.game_title ORDER BY gp.played_at DESC) FILTER (WHERE gp.game_title IS NOT NULL))[1] AS game_title,
    (array_agg(gp.game_category ORDER BY gp.played_at DESC) FILTER (WHERE gp.game_category IS NOT NULL))[1] AS game_category,
    COUNT(*)::bigint AS plays,
    COUNT(DISTINCT gp.user_id)::bigint AS players
  FROM public.games_plays gp
  WHERE gp.played_at >= now() - CASE WHEN _period = 'month' THEN interval '30 days' ELSE interval '7 days' END
    AND (_category IS NULL OR gp.game_category = _category)
  GROUP BY gp.game_id
  ORDER BY plays DESC, players DESC
  LIMIT GREATEST(1, LEAST(_limit, 50));
$$;

GRANT EXECUTE ON FUNCTION public.top_games(text, text, int) TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_games_plays_played_at ON public.games_plays (played_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_plays_category_played_at ON public.games_plays (game_category, played_at DESC);
