CREATE OR REPLACE FUNCTION public.get_module_xp_leaderboard(_source_prefix text, _limit integer DEFAULT 10)
RETURNS TABLE (user_id uuid, display_name text, avatar_url text, total_xp bigint, entries bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id,
         COALESCE(NULLIF(p.full_name, ''), NULLIF(p.username, ''), 'Player') AS display_name,
         p.avatar_url,
         SUM(e.amount)::bigint AS total_xp,
         COUNT(*)::bigint AS entries
  FROM public.xp_events e
  LEFT JOIN public.profiles p ON p.id = e.user_id
  WHERE e.source LIKE _source_prefix || '%'
  GROUP BY e.user_id, p.full_name, p.username, p.avatar_url
  ORDER BY total_xp DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 10), 1), 50);
$$;

GRANT EXECUTE ON FUNCTION public.get_module_xp_leaderboard(text, integer) TO authenticated;