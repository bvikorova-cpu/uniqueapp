
CREATE OR REPLACE FUNCTION public.admin_premium_videos_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT jsonb_build_object(
    'total_videos', (SELECT COUNT(*) FROM public.premium_videos),
    'published_videos', (SELECT COUNT(*) FROM public.premium_videos WHERE is_published),
    'creators', (SELECT COUNT(DISTINCT user_id) FROM public.premium_videos),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.premium_videos),
    'total_unlocks', (SELECT COUNT(*) FROM public.premium_video_unlocks),
    'unlock_credits_spent', (SELECT COALESCE(SUM(credits_spent),0) FROM public.premium_video_unlocks),
    'creator_earned_credits', (SELECT COALESCE(SUM(credited_total),0) FROM public.premium_video_creator_balance),
    'creator_withdrawn_credits', (SELECT COALESCE(SUM(withdrawn_credits),0) FROM public.premium_video_creator_balance),
    'credits_purchased', (SELECT COALESCE(SUM(total_credits_purchased),0) FROM public.video_credits),
    'credits_remaining', (SELECT COALESCE(SUM(credits_remaining),0) FROM public.video_credits),
    'boosts', (SELECT COUNT(*) FROM public.premium_video_boosts),
    'boost_credits_spent', (SELECT COALESCE(SUM(credits_spent),0) FROM public.premium_video_boosts),
    'active_boosts', (SELECT COUNT(*) FROM public.premium_video_boosts WHERE expires_at > now()),
    'cashouts_count', (SELECT COUNT(*) FROM public.transactions WHERE transaction_type = 'creator_earnings' AND item_type = 'premium_video'),
    'cashouts_eur', (SELECT COALESCE(SUM(amount),0) FROM public.transactions WHERE transaction_type = 'creator_earnings' AND item_type = 'premium_video')
  ) INTO r;

  RETURN r;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_premium_videos_creators()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  username text,
  email text,
  avatar_url text,
  videos_count bigint,
  published_count bigint,
  views_total bigint,
  unlocks_total bigint,
  earned_credits numeric,
  withdrawn_credits numeric,
  withdrawable_credits numeric,
  wallet_credits numeric,
  purchased_credits numeric,
  boost_credits numeric,
  cashed_out_eur numeric,
  last_upload_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  WITH ids AS (
    SELECT DISTINCT u FROM (
      SELECT pv.user_id AS u FROM public.premium_videos pv
      UNION SELECT b.user_id FROM public.premium_video_creator_balance b
      UNION SELECT vc.user_id FROM public.video_credits vc
    ) s WHERE u IS NOT NULL
  ),
  vids AS (
    SELECT pv.user_id,
           COUNT(*)::bigint AS videos_count,
           COUNT(*) FILTER (WHERE pv.is_published)::bigint AS published_count,
           COALESCE(SUM(pv.views_count),0)::bigint AS views_total,
           MAX(pv.created_at) AS last_upload_at
    FROM public.premium_videos pv GROUP BY pv.user_id
  ),
  unl AS (
    SELECT pv.user_id, COUNT(*)::bigint AS unlocks_total
    FROM public.premium_video_unlocks pu
    JOIN public.premium_videos pv ON pv.id = pu.video_id
    GROUP BY pv.user_id
  ),
  bst AS (
    SELECT pb.user_id, COALESCE(SUM(pb.credits_spent),0)::numeric AS boost_credits
    FROM public.premium_video_boosts pb GROUP BY pb.user_id
  ),
  cash AS (
    SELECT t.user_id, COALESCE(SUM(t.amount),0)::numeric AS cashed_out_eur
    FROM public.transactions t
    WHERE t.transaction_type = 'creator_earnings' AND t.item_type = 'premium_video'
    GROUP BY t.user_id
  )
  SELECT i.u,
         p.full_name,
         p.username,
         p.email,
         p.avatar_url,
         COALESCE(v.videos_count,0),
         COALESCE(v.published_count,0),
         COALESCE(v.views_total,0),
         COALESCE(un.unlocks_total,0),
         COALESCE(b.credited_total,0)::numeric,
         COALESCE(b.withdrawn_credits,0)::numeric,
         GREATEST(COALESCE(b.credited_total,0) - COALESCE(b.withdrawn_credits,0), 0)::numeric,
         COALESCE(vc.credits_remaining,0)::numeric,
         COALESCE(vc.total_credits_purchased,0)::numeric,
         COALESCE(bs.boost_credits,0),
         COALESCE(c.cashed_out_eur,0),
         v.last_upload_at
  FROM ids i
  LEFT JOIN public.profiles p ON p.id = i.u
  LEFT JOIN vids v ON v.user_id = i.u
  LEFT JOIN unl un ON un.user_id = i.u
  LEFT JOIN public.premium_video_creator_balance b ON b.user_id = i.u
  LEFT JOIN public.video_credits vc ON vc.user_id = i.u
  LEFT JOIN bst bs ON bs.user_id = i.u
  LEFT JOIN cash c ON c.user_id = i.u
  ORDER BY COALESCE(un.unlocks_total,0) DESC, COALESCE(v.videos_count,0) DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_premium_videos_list()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  creator_name text,
  title text,
  is_published boolean,
  duration_seconds integer,
  unlock_cost integer,
  unlocks_count integer,
  views_count integer,
  boost_tier text,
  boost_until timestamptz,
  frame_slug text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT pv.id, pv.user_id,
         COALESCE(p.full_name, p.username, 'Unknown'),
         pv.title, pv.is_published, pv.duration_seconds, pv.unlock_cost,
         pv.unlocks_count, pv.views_count, pv.boost_tier, pv.boost_until,
         pv.frame_slug, pv.created_at
  FROM public.premium_videos pv
  LEFT JOIN public.profiles p ON p.id = pv.user_id
  ORDER BY pv.created_at DESC
  LIMIT 300;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_premium_videos_activity()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT jsonb_build_object(
    'unlocks', COALESCE((
      SELECT jsonb_agg(x) FROM (
        SELECT pu.created_at, pu.credits_spent,
               COALESCE(bp.full_name, bp.username, 'User') AS buyer,
               COALESCE(cp.full_name, cp.username, 'User') AS creator,
               pv.title
        FROM public.premium_video_unlocks pu
        LEFT JOIN public.premium_videos pv ON pv.id = pu.video_id
        LEFT JOIN public.profiles bp ON bp.id = pu.user_id
        LEFT JOIN public.profiles cp ON cp.id = pv.user_id
        ORDER BY pu.created_at DESC LIMIT 100
      ) x), '[]'::jsonb),
    'purchases', COALESCE((
      SELECT jsonb_agg(y) FROM (
        SELECT l.created_at, l.delta, l.reason, l.source, l.balance_after,
               COALESCE(p.full_name, p.username, 'User') AS user_name
        FROM public.video_credits_ledger l
        LEFT JOIN public.profiles p ON p.id = l.user_id
        ORDER BY l.created_at DESC LIMIT 100
      ) y), '[]'::jsonb),
    'payouts', COALESCE((
      SELECT jsonb_agg(z) FROM (
        SELECT t.created_at, t.amount, t.status,
               COALESCE(p.full_name, p.username, 'User') AS user_name
        FROM public.transactions t
        LEFT JOIN public.profiles p ON p.id = t.user_id
        WHERE t.transaction_type = 'creator_earnings' AND t.item_type = 'premium_video'
        ORDER BY t.created_at DESC LIMIT 100
      ) z), '[]'::jsonb)
  ) INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_premium_videos_summary() FROM anon;
REVOKE ALL ON FUNCTION public.admin_premium_videos_creators() FROM anon;
REVOKE ALL ON FUNCTION public.admin_premium_videos_list() FROM anon;
REVOKE ALL ON FUNCTION public.admin_premium_videos_activity() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_premium_videos_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_premium_videos_creators() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_premium_videos_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_premium_videos_activity() TO authenticated;
