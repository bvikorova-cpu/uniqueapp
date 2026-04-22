
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(period TEXT DEFAULT 'all_time')
RETURNS TABLE (
  referrer_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  successful_referrals BIGINT,
  total_earned NUMERIC,
  rank BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff TIMESTAMPTZ;
BEGIN
  cutoff := CASE period
    WHEN 'week'  THEN now() - INTERVAL '7 days'
    WHEN 'month' THEN now() - INTERVAL '30 days'
    ELSE '1970-01-01'::timestamptz
  END;

  RETURN QUERY
  WITH agg AS (
    SELECT
      e.referrer_id,
      COUNT(*)::BIGINT AS successful_referrals,
      COALESCE(SUM(e.amount), 0)::NUMERIC AS total_earned
    FROM public.megatalent_referral_earnings e
    WHERE e.auto_credited = true
      AND e.created_at >= cutoff
    GROUP BY e.referrer_id
  )
  SELECT
    a.referrer_id,
    COALESCE(p.full_name, 'Anonymous') AS display_name,
    p.avatar_url,
    a.successful_referrals,
    a.total_earned,
    ROW_NUMBER() OVER (ORDER BY a.successful_referrals DESC, a.total_earned DESC) AS rank
  FROM agg a
  LEFT JOIN public.profiles p ON p.id = a.referrer_id
  ORDER BY a.successful_referrals DESC, a.total_earned DESC
  LIMIT 100;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_referral_leaderboard(TEXT) TO anon, authenticated;
