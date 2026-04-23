CREATE TABLE IF NOT EXISTS public.rewarded_ad_fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, flag_date)
);

ALTER TABLE public.rewarded_ad_fraud_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own flags" ON public.rewarded_ad_fraud_flags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all flags" ON public.rewarded_ad_fraud_flags
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_rewarded_ad_views_user_created
  ON public.rewarded_ad_views(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_weekly_xp_leaderboard()
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  weekly_xp BIGINT,
  view_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(rav.xp_awarded) DESC) AS rank,
    rav.user_id,
    COALESCE(p.full_name, 'Anonymous') AS display_name,
    p.avatar_url,
    SUM(rav.xp_awarded)::BIGINT AS weekly_xp,
    COUNT(*)::BIGINT AS view_count
  FROM public.rewarded_ad_views rav
  LEFT JOIN public.profiles p ON p.id = rav.user_id
  WHERE rav.created_at >= date_trunc('week', now())
  GROUP BY rav.user_id, p.full_name, p.avatar_url
  ORDER BY weekly_xp DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_weekly_xp_leaderboard() TO anon, authenticated;