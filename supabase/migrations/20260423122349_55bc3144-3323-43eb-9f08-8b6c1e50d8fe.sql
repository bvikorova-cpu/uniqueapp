
-- Immutable bucket helper for throttle index
CREATE OR REPLACE FUNCTION public.bucket_30s(ts TIMESTAMPTZ)
RETURNS BIGINT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (EXTRACT(EPOCH FROM ts)::BIGINT / 30);
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rewarded_ad_views_throttle
  ON public.rewarded_ad_views (user_id, public.bucket_30s(created_at));

-- Historical winners
CREATE TABLE IF NOT EXISTS public.weekly_xp_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  rank INT NOT NULL,
  user_id UUID NOT NULL,
  weekly_xp BIGINT NOT NULL,
  view_count BIGINT NOT NULL,
  bonus_xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_start, rank)
);

ALTER TABLE public.weekly_xp_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view winners" ON public.weekly_xp_winners
  FOR SELECT USING (true);

CREATE POLICY "Admins manage winners" ON public.weekly_xp_winners
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_weekly_winners_week ON public.weekly_xp_winners(week_start DESC, rank ASC);

CREATE OR REPLACE FUNCTION public.get_last_week_xp_winners()
RETURNS TABLE (
  rank INT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  weekly_xp BIGINT,
  view_count BIGINT,
  bonus_xp INT,
  week_start DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.rank,
    w.user_id,
    COALESCE(p.full_name, 'Anonymous') AS display_name,
    p.avatar_url,
    w.weekly_xp,
    w.view_count,
    w.bonus_xp,
    w.week_start
  FROM public.weekly_xp_winners w
  LEFT JOIN public.profiles p ON p.id = w.user_id
  WHERE w.week_start = (
    SELECT MAX(week_start) FROM public.weekly_xp_winners
    WHERE week_start < date_trunc('week', now())::date
  )
  ORDER BY w.rank ASC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.get_last_week_xp_winners() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.snapshot_weekly_xp_winners()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_week_start DATE;
  prev_week_end TIMESTAMPTZ;
  inserted INT := 0;
  rec RECORD;
  bonus INT;
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

    inserted := inserted + 1;
  END LOOP;

  RETURN inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.snapshot_weekly_xp_winners() TO service_role;
