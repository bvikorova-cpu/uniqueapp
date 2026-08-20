CREATE OR REPLACE FUNCTION public.admin_challenge_subscribers(_challenge text DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  challenge text,
  tier text,
  active_until timestamptz,
  is_active boolean,
  started_at timestamptz,
  months_billed integer,
  monthly_price_eur numeric,
  total_paid_eur numeric,
  stripe_subscription_id text,
  stripe_customer_id text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admins only';
  END IF;

  RETURN QUERY
  SELECT
    s.user_id,
    COALESCE(p.full_name, 'User') AS full_name,
    u.email::text,
    s.challenge,
    COALESCE(s.tier, 'pro') AS tier,
    s.active_until,
    (s.active_until IS NOT NULL AND s.active_until > now()) AS is_active,
    s.created_at AS started_at,
    GREATEST(1, (
      (date_part('year', now()) - date_part('year', s.created_at))::int * 12
      + (date_part('month', now()) - date_part('month', s.created_at))::int
    ) + 1)::int AS months_billed,
    (CASE WHEN COALESCE(s.tier, 'pro') = 'top' THEN 5 ELSE 3 END)::numeric AS monthly_price_eur,
    ((CASE WHEN COALESCE(s.tier, 'pro') = 'top' THEN 5 ELSE 3 END)::numeric
      * GREATEST(1, (
        (date_part('year', now()) - date_part('year', s.created_at))::int * 12
        + (date_part('month', now()) - date_part('month', s.created_at))::int
      ) + 1)) AS total_paid_eur,
    s.stripe_subscription_id,
    s.stripe_customer_id
  FROM public.challenge_pro_subscribers s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN auth.users u ON u.id = s.user_id
  WHERE (_challenge IS NULL OR s.challenge = _challenge)
  ORDER BY s.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_challenge_subscribers(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_challenge_subscribers(text) TO authenticated;