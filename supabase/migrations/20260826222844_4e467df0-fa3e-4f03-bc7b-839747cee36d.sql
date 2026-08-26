CREATE OR REPLACE FUNCTION public.get_creator_available_cents(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    0,
    COALESCE((
      SELECT SUM(seller_amount)::numeric * 100
      FROM public.transactions
      WHERE seller_id = _user_id AND status = 'released'
    ), 0)
    +
    COALESCE((
      SELECT SUM(net_cents)
      FROM public.creator_subscription_earnings
      WHERE creator_id = _user_id AND payout_state IN ('available','pending')
    ), 0)
    +
    COALESCE((
      SELECT SUM(recipient_amount_cents)::numeric
      FROM public.profile_tips
      WHERE recipient_id = _user_id AND status = 'completed'
    ), 0)
    -
    COALESCE((
      SELECT SUM(amount_cents + fee_cents)
      FROM public.creator_payouts
      WHERE user_id = _user_id AND status IN ('pending','processing','paid')
    ), 0)
  )::BIGINT;
$$;