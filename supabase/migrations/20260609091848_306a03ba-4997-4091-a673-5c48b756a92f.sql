CREATE TABLE IF NOT EXISTS public.creator_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  fee_cents BIGINT NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  method TEXT NOT NULL DEFAULT 'standard' CHECK (method IN ('standard','instant')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','canceled')),
  stripe_payout_id TEXT,
  stripe_connect_account_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_creator_payouts_user_status ON public.creator_payouts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_created ON public.creator_payouts(created_at DESC);

GRANT SELECT ON public.creator_payouts TO authenticated;
GRANT ALL ON public.creator_payouts TO service_role;

ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts"
  ON public.creator_payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payouts"
  ON public.creator_payouts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.tg_creator_payouts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_creator_payouts_updated_at ON public.creator_payouts;
CREATE TRIGGER trg_creator_payouts_updated_at
  BEFORE UPDATE ON public.creator_payouts
  FOR EACH ROW EXECUTE FUNCTION public.tg_creator_payouts_updated_at();

-- Server-side available balance for creator earnings
CREATE OR REPLACE FUNCTION public.get_creator_available_cents(_user_id UUID)
RETURNS BIGINT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(
    0,
    COALESCE((
      SELECT SUM(seller_amount)::numeric * 100
      FROM public.transactions
      WHERE seller_id = _user_id AND status = 'released'
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