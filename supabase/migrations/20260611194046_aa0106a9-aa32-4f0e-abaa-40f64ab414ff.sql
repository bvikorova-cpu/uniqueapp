CREATE TABLE IF NOT EXISTS public.creator_subscription_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  subscriber_id UUID,
  tier_id UUID,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT UNIQUE,
  gross_cents BIGINT NOT NULL CHECK (gross_cents >= 0),
  platform_fee_cents BIGINT NOT NULL CHECK (platform_fee_cents >= 0),
  net_cents BIGINT NOT NULL CHECK (net_cents >= 0),
  platform_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  currency TEXT NOT NULL DEFAULT 'eur',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  payout_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (payout_state IN ('pending','available','paid','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.creator_subscription_earnings TO authenticated;
GRANT ALL ON public.creator_subscription_earnings TO service_role;

ALTER TABLE public.creator_subscription_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creator reads own earnings" ON public.creator_subscription_earnings;
CREATE POLICY "creator reads own earnings"
  ON public.creator_subscription_earnings FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "admin reads all earnings" ON public.creator_subscription_earnings;
CREATE POLICY "admin reads all earnings"
  ON public.creator_subscription_earnings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_cse_creator ON public.creator_subscription_earnings(creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cse_sub ON public.creator_subscription_earnings(stripe_subscription_id);

CREATE OR REPLACE FUNCTION public.get_creator_available_cents(_user_id UUID)
RETURNS BIGINT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
    -
    COALESCE((
      SELECT SUM(amount_cents + fee_cents)
      FROM public.creator_payouts
      WHERE user_id = _user_id AND status IN ('pending','processing','paid')
    ), 0)
  )::BIGINT;
$$;

GRANT EXECUTE ON FUNCTION public.get_creator_available_cents(UUID) TO authenticated, service_role;