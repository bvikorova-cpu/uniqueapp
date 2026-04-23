-- #7 user's own weekly rank
CREATE OR REPLACE FUNCTION public.get_my_weekly_xp_rank()
RETURNS TABLE(rank bigint, weekly_xp bigint, view_count bigint, total_participants bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  WITH ranked AS (
    SELECT
      rav.user_id,
      SUM(rav.xp_awarded)::BIGINT AS xp,
      COUNT(*)::BIGINT AS views,
      ROW_NUMBER() OVER (ORDER BY SUM(rav.xp_awarded) DESC) AS rnk
    FROM public.rewarded_ad_views rav
    WHERE rav.created_at >= date_trunc('week', now())
    GROUP BY rav.user_id
  )
  SELECT r.rnk, r.xp, r.views, (SELECT COUNT(*) FROM ranked)::bigint
  FROM ranked r
  WHERE r.user_id = auth.uid();
$$;

-- #8 winners notifications via snapshot
CREATE OR REPLACE FUNCTION public.snapshot_weekly_xp_winners()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  prev_week_start DATE;
  prev_week_end TIMESTAMPTZ;
  inserted INT := 0;
  rec RECORD;
  bonus INT;
  notif_title TEXT;
  notif_msg TEXT;
BEGIN
  prev_week_start := (date_trunc('week', now()) - INTERVAL '1 week')::date;
  prev_week_end := date_trunc('week', now());

  IF EXISTS (SELECT 1 FROM public.weekly_xp_winners WHERE week_start = prev_week_start) THEN
    RETURN 0;
  END IF;

  FOR rec IN
    SELECT
      ROW_NUMBER() OVER (ORDER BY SUM(xp_awarded) DESC)::INT AS rnk,
      user_id,
      SUM(xp_awarded)::BIGINT AS xp,
      COUNT(*)::BIGINT AS views
    FROM public.rewarded_ad_views
    WHERE created_at >= prev_week_start AND created_at < prev_week_end
    GROUP BY user_id
    ORDER BY xp DESC
    LIMIT 10
  LOOP
    bonus := CASE rec.rnk WHEN 1 THEN 100 WHEN 2 THEN 50 WHEN 3 THEN 25 ELSE 0 END;
    INSERT INTO public.weekly_xp_winners (week_start, rank, user_id, weekly_xp, view_count, bonus_xp)
    VALUES (prev_week_start, rec.rnk, rec.user_id, rec.xp, rec.views, bonus);

    IF bonus > 0 THEN
      PERFORM public.add_user_points(rec.user_id, bonus, 'weekly_xp_top_' || rec.rnk);
    END IF;

    -- in-app notification for top 10
    IF rec.rnk = 1 THEN
      notif_title := '👑 You won the Weekly XP Leaderboard!';
      notif_msg := 'Congrats! You finished #1 last week with ' || rec.xp || ' XP and earned a +' || bonus || ' XP bonus.';
    ELSIF rec.rnk = 2 THEN
      notif_title := '🥈 Silver medal!';
      notif_msg := 'You finished #2 last week with ' || rec.xp || ' XP. +' || bonus || ' XP bonus added!';
    ELSIF rec.rnk = 3 THEN
      notif_title := '🥉 Bronze medal!';
      notif_msg := 'You finished #3 last week with ' || rec.xp || ' XP. +' || bonus || ' XP bonus added!';
    ELSE
      notif_title := '🏆 Top 10 finish!';
      notif_msg := 'You finished #' || rec.rnk || ' last week with ' || rec.xp || ' XP. Keep going!';
    END IF;

    INSERT INTO public.notifications (user_id, title, message, type, is_read)
    VALUES (rec.user_id, notif_title, notif_msg, 'weekly_xp_winner', false);

    inserted := inserted + 1;
  END LOOP;

  RETURN inserted;
END;
$$;

-- #9 streak bonus helper: count consecutive days with at least 1 rewarded ad view
CREATE OR REPLACE FUNCTION public.compute_xp_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  s INT := 0;
  d DATE := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (SELECT 1 FROM public.rewarded_ad_views WHERE user_id = p_user_id AND view_date = d) THEN
      s := s + 1;
      d := d - 1;
    ELSE
      EXIT;
    END IF;
    IF s > 365 THEN EXIT; END IF;
  END LOOP;
  RETURN s;
END;
$$;