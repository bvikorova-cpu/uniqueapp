CREATE OR REPLACE FUNCTION public.admin_list_users_overview(p_search text DEFAULT NULL, p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  username text,
  email text,
  created_at timestamptz,
  credits_remaining int,
  mt_tier text,
  mt_status text,
  mt_expires_at timestamptz,
  other_subscriptions jsonb,
  referred_by_id uuid,
  referred_by_name text,
  referral_code text,
  referral_reward_amount numeric,
  referral_reward_paid boolean,
  referral_status text,
  total_referrals bigint,
  total_referral_earnings numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.username,
    p.email,
    p.created_at,
    COALESCE(c.credits_remaining, 0)::int,
    ms.tier::text,
    ms.status::text,
    ms.expires_at,
    COALESCE(us.subs, '[]'::jsonb),
    ra.referrer_id,
    rp.full_name,
    ra.code,
    re.amount,
    re.paid,
    ra.status,
    COALESCE(mine.cnt, 0),
    COALESCE(mine.total, 0)
  FROM public.profiles p
  LEFT JOIN public.ai_credits c ON c.user_id = p.id
  LEFT JOIN LATERAL (
    SELECT s.tier, s.status, s.expires_at
    FROM public.megatalent_subscriptions s
    WHERE s.user_id = p.id
    ORDER BY s.created_at DESC
    LIMIT 1
  ) ms ON true
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(jsonb_build_object(
      'tier', x.subscription_tier,
      'status', x.subscription_status,
      'ends_at', x.subscription_end
    ) ORDER BY x.created_at DESC) AS subs
    FROM public.user_subscriptions x
    WHERE x.user_id = p.id
  ) us ON true
  LEFT JOIN public.referral_attributions ra ON ra.referred_user_id = p.id
  LEFT JOIN public.profiles rp ON rp.id = ra.referrer_id
  LEFT JOIN LATERAL (
    SELECT e.amount, e.paid
    FROM public.megatalent_referral_earnings e
    WHERE e.referred_user_id = p.id
    ORDER BY e.created_at DESC
    LIMIT 1
  ) re ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt, COALESCE(SUM(e2.amount), 0) AS total
    FROM public.megatalent_referral_earnings e2
    WHERE e2.referrer_id = p.id
  ) mine ON true
  WHERE p_search IS NULL OR p_search = '' OR (
    p.full_name ILIKE '%' || p_search || '%'
    OR p.username ILIKE '%' || p_search || '%'
    OR p.email ILIKE '%' || p_search || '%'
  )
  ORDER BY p.created_at DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_referral_rewards(p_limit int DEFAULT 100, p_offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  referrer_id uuid,
  referrer_name text,
  referrer_email text,
  referred_user_id uuid,
  referred_name text,
  referred_email text,
  code text,
  amount numeric,
  paid boolean,
  auto_credited boolean,
  source_kind text,
  source_subscription_id text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.created_at,
    e.referrer_id,
    rp.full_name,
    rp.email,
    e.referred_user_id,
    dp.full_name,
    dp.email,
    ra.code,
    e.amount,
    e.paid,
    e.auto_credited,
    e.source_kind,
    e.source_subscription_id
  FROM public.megatalent_referral_earnings e
  LEFT JOIN public.profiles rp ON rp.id = e.referrer_id
  LEFT JOIN public.profiles dp ON dp.id = e.referred_user_id
  LEFT JOIN public.referral_attributions ra ON ra.referred_user_id = e.referred_user_id
  ORDER BY e.created_at DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 100), 500), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users_overview(text, int, int) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_referral_rewards(int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users_overview(text, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_referral_rewards(int, int) TO authenticated;