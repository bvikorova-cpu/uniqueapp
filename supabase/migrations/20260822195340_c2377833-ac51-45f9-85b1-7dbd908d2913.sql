CREATE OR REPLACE FUNCTION public.refresh_league_week()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  wk_start timestamptz;
  uid uuid := auth.uid();
BEGIN
  SELECT * INTO s FROM public.league_seasons WHERE is_active ORDER BY starts_at DESC LIMIT 1;
  IF s.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'no_active_season'); END IF;

  wk_start := GREATEST(s.starts_at, date_trunc('week', now()));

  -- real weekly XP per user, from the XP ledger with activity_logs as fallback source
  WITH earned AS (
    SELECT user_id, SUM(amount)::int AS xp
    FROM public.xp_events
    WHERE created_at >= wk_start AND amount > 0
    GROUP BY user_id
    UNION ALL
    SELECT user_id, SUM(points_earned)::int AS xp
    FROM public.activity_logs
    WHERE created_at >= wk_start AND points_earned > 0
      AND user_id NOT IN (SELECT user_id FROM public.xp_events WHERE created_at >= wk_start)
    GROUP BY user_id
  ), totals AS (
    SELECT user_id, SUM(xp)::int AS xp FROM earned GROUP BY user_id
  )
  INSERT INTO public.user_league_standings (user_id, season_id, tier, group_number, weekly_xp)
  SELECT t.user_id, s.id, 'bronze', 1, t.xp FROM totals t
  ON CONFLICT (user_id, season_id)
  DO UPDATE SET weekly_xp = EXCLUDED.weekly_xp, updated_at = now();

  -- ensure caller always has a row
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_league_standings (user_id, season_id, tier, group_number, weekly_xp)
    VALUES (uid, s.id, 'bronze', 1, 0)
    ON CONFLICT (user_id, season_id) DO NOTHING;
  END IF;

  -- ranks inside each tier/group
  UPDATE public.user_league_standings u
  SET rank = r.rn
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY tier, group_number ORDER BY weekly_xp DESC, updated_at ASC) rn
    FROM public.user_league_standings WHERE season_id = s.id
  ) r
  WHERE u.id = r.id AND COALESCE(u.rank, -1) <> r.rn;

  RETURN jsonb_build_object('ok', true, 'season_id', s.id, 'week_start', wk_start);
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_league_week() TO authenticated, anon, service_role;