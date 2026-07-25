CREATE OR REPLACE FUNCTION public.get_mystery_box_public_stats()
RETURNS TABLE(
  boxes_opened bigint,
  active_players bigint,
  legendary_drops bigint,
  jackpot_pool numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((
      SELECT count(*)::bigint
      FROM public.user_mystery_boxes
      WHERE is_opened = true
    ), 0) AS boxes_opened,
    COALESCE((
      SELECT count(DISTINCT user_id)::bigint
      FROM public.user_mystery_boxes
      WHERE purchased_at >= now() - interval '24 hours'
    ), 0) AS active_players,
    COALESCE((
      SELECT count(*)::bigint
      FROM public.mystery_box_rewards r
      LEFT JOIN public.mystery_box_items i ON i.id = r.item_id
      WHERE COALESCE(i.rarity::text, '') IN ('epic', 'legendary')
    ), 0) AS legendary_drops,
    COALESCE((
      SELECT round((count(*)::numeric * 0.25), 2)
      FROM public.user_mystery_boxes
      WHERE is_opened = true
    ), 0) AS jackpot_pool;
$$;

REVOKE ALL ON FUNCTION public.get_mystery_box_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_mystery_box_public_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_mystery_box_public_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mystery_box_public_stats() TO service_role;