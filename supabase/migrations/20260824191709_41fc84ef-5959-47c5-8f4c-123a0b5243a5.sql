CREATE OR REPLACE FUNCTION public.admin_list_users_overview(
  p_search text DEFAULT NULL::text,
  p_name text DEFAULT NULL::text,
  p_email text DEFAULT NULL::text,
  p_subscription_status text DEFAULT NULL::text,
  p_referral_code text DEFAULT NULL::text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  username text,
  email text,
  created_at timestamp with time zone,
  credits_remaining integer,
  mt_tier text,
  mt_status text,
  mt_expires_at timestamp with time zone,
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  WHERE
    -- legacy free-text search across name/username/email
    (p_search IS NULL OR p_search = '' OR (
      p.full_name ILIKE '%' || p_search || '%'
      OR p.username ILIKE '%' || p_search || '%'
      OR p.email ILIKE '%' || p_search || '%'
    ))
    -- individual filters
    AND (p_name IS NULL OR p_name = '' OR p.full_name ILIKE '%' || p_name || '%')
    AND (p_email IS NULL OR p_email = '' OR p.email ILIKE '%' || p_email || '%')
    AND (
      p_subscription_status IS NULL OR p_subscription_status = '' OR p_subscription_status = 'all'
      OR (
        p_subscription_status = 'active' AND ms.status = 'active'
      )
      OR (
        p_subscription_status = 'inactive' AND (ms.status IS NULL OR ms.status != 'active')
      )
      OR (
        p_subscription_status = 'any_subscription' AND (ms.status IS NOT NULL OR us.subs IS NOT NULL AND jsonb_array_length(us.subs) > 0)
      )
    )
    AND (p_referral_code IS NULL OR p_referral_code = '' OR ra.code ILIKE '%' || p_referral_code || '%')
  ORDER BY p.created_at DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 50), 200), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
END;
$function$;

-- Helper that returns a user's unpaid MegaTalent earnings split by source.
-- Used by the combined referral + tips payout flow.
CREATE OR REPLACE FUNCTION public.get_megatalent_earnings_breakdown(_user_id uuid)
RETURNS TABLE(
  source text,
  id text,
  amount numeric,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'referral'::text, e.id::text, e.amount, e.created_at
  FROM public.megatalent_referral_earnings e
  WHERE e.referrer_id = _user_id AND e.paid = false
  UNION ALL
  SELECT 'tip'::text, t.id::text, (t.creator_amount_cents / 100.0)::numeric, t.created_at
  FROM public.megatalent_tips t
  WHERE t.creator_id = _user_id AND t.status = 'completed' AND COALESCE(t.payout_status, '') != 'paid'
  ORDER BY created_at ASC;
$$;

-- Ensure the payout_status column exists on megatalent_tips and has a sensible default.
-- (It already exists in the current schema; this is idempotent.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'megatalent_tips' AND column_name = 'payout_status'
  ) THEN
    ALTER TABLE public.megatalent_tips ADD COLUMN payout_status text DEFAULT 'pending';
  END IF;
END
$$;
