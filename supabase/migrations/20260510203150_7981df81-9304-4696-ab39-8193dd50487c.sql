
-- 1. Clicks table
CREATE TABLE IF NOT EXISTS public.referral_link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  ip_hash text,
  user_agent text,
  country text,
  referrer_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_link_clicks_code ON public.referral_link_clicks(code);
CREATE INDEX IF NOT EXISTS idx_referral_link_clicks_created ON public.referral_link_clicks(created_at DESC);

ALTER TABLE public.referral_link_clicks ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins can read clicks"
ON public.referral_link_clicks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Inserts go through the edge function with service role; no public insert policy needed.

-- 2. Funnel aggregate function (admin-only)
CREATE OR REPLACE FUNCTION public.get_referral_funnel(_period text DEFAULT 'all_time')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _since timestamptz;
  _clicks bigint;
  _signups bigint;
  _paid bigint;
  _approved bigint;
  _payout numeric;
  _top jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  _since := CASE _period
    WHEN 'week'  THEN now() - interval '7 days'
    WHEN 'month' THEN now() - interval '30 days'
    ELSE '1970-01-01'::timestamptz
  END;

  SELECT COUNT(*) INTO _clicks
  FROM public.referral_link_clicks WHERE created_at >= _since;

  SELECT COUNT(*) INTO _signups
  FROM public.referral_attributions WHERE created_at >= _since;

  SELECT COUNT(*) INTO _paid
  FROM public.referral_attributions
  WHERE created_at >= _since AND rewarded_at IS NOT NULL;

  SELECT COUNT(*) INTO _approved
  FROM public.referral_attributions
  WHERE created_at >= _since AND status = 'approved';

  SELECT COALESCE(SUM(amount), 0) INTO _payout
  FROM public.megatalent_referral_earnings
  WHERE created_at >= _since AND auto_credited = true;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO _top FROM (
    SELECT code, COUNT(*) AS clicks
    FROM public.referral_link_clicks
    WHERE created_at >= _since
    GROUP BY code
    ORDER BY clicks DESC
    LIMIT 10
  ) t;

  RETURN jsonb_build_object(
    'period', _period,
    'clicks', _clicks,
    'signups', _signups,
    'paid', _paid,
    'approved', _approved,
    'payout_total', _payout,
    'click_to_signup_pct', CASE WHEN _clicks > 0 THEN ROUND((_signups::numeric / _clicks) * 100, 2) ELSE 0 END,
    'signup_to_paid_pct',  CASE WHEN _signups > 0 THEN ROUND((_paid::numeric / _signups) * 100, 2) ELSE 0 END,
    'click_to_paid_pct',   CASE WHEN _clicks > 0 THEN ROUND((_paid::numeric / _clicks) * 100, 2) ELSE 0 END,
    'top_codes', _top
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_referral_funnel(text) TO authenticated;
