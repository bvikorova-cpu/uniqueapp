CREATE OR REPLACE FUNCTION public.hero_card_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  unique_cards integer,
  total_cards integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.user_id,
         COALESCE(p.full_name, p.username, 'Anonymous collector')::text AS display_name,
         p.avatar_url::text,
         COUNT(DISTINCT c.collectible_id)::int AS unique_cards,
         COUNT(*)::int AS total_cards
  FROM public.hero_collection_cards c
  LEFT JOIN public.profiles p ON p.id = c.user_id
  GROUP BY c.user_id, p.full_name, p.username, p.avatar_url
  ORDER BY unique_cards DESC, total_cards DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 100)
$$;

GRANT EXECUTE ON FUNCTION public.hero_card_leaderboard(integer) TO authenticated, anon;