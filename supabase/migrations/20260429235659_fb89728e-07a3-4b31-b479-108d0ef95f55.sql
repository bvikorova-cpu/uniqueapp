-- ============================================================
-- CAMPAIGN PAYOUTS (Stripe Connect Express → campaign owners)
-- ============================================================

-- 1. Audit table for every payout request
CREATE TABLE IF NOT EXISTS public.campaign_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN
    ('medical','dream','hero','pet','student','crisis','talent')),
  owner_user_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_transfer_id TEXT,
  stripe_destination_account TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','completed','failed','reversed')),
  failure_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_payouts_campaign
  ON public.campaign_payouts (campaign_type, campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_payouts_owner
  ON public.campaign_payouts (owner_user_id);

ALTER TABLE public.campaign_payouts ENABLE ROW LEVEL SECURITY;

-- Owners can read their own payouts
CREATE POLICY "Owners can view own payouts"
  ON public.campaign_payouts FOR SELECT
  USING (auth.uid() = owner_user_id);

-- Admins can read all
CREATE POLICY "Admins can view all payouts"
  ON public.campaign_payouts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only edge functions (service_role) write — no INSERT/UPDATE policies for users.

-- 2. Compute available balance for a campaign
--    raised_net (sum of net_amount of completed donations)
--    minus already-paid-out (pending + completed payouts)
CREATE OR REPLACE FUNCTION public.get_campaign_available_balance(
  _campaign_type TEXT,
  _campaign_id UUID
) RETURNS TABLE(
  total_raised_cents BIGINT,
  total_paid_out_cents BIGINT,
  available_cents BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _raised NUMERIC := 0;
  _paid BIGINT := 0;
BEGIN
  SELECT COALESCE(SUM(net_amount), 0) INTO _raised
  FROM public.campaign_donations
  WHERE campaign_id = _campaign_id
    AND campaign_type = _campaign_type
    AND status = 'completed';

  SELECT COALESCE(SUM(amount_cents), 0) INTO _paid
  FROM public.campaign_payouts
  WHERE campaign_id = _campaign_id
    AND campaign_type = _campaign_type
    AND status IN ('pending','completed');

  total_raised_cents := (_raised * 100)::BIGINT;
  total_paid_out_cents := _paid;
  available_cents := GREATEST(total_raised_cents - total_paid_out_cents, 0);
  RETURN NEXT;
END;
$$;

-- 3. Verify caller owns the campaign (campaign_type → table name)
CREATE OR REPLACE FUNCTION public.is_campaign_owner(
  _user_id UUID,
  _campaign_type TEXT,
  _campaign_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _table TEXT;
  _owner UUID;
BEGIN
  _table := CASE _campaign_type
    WHEN 'medical' THEN 'medical_campaigns'
    WHEN 'dream'   THEN 'dream_campaigns'
    WHEN 'hero'    THEN 'hero_campaigns'
    WHEN 'pet'     THEN 'pet_campaigns'
    WHEN 'student' THEN 'student_campaigns'
    WHEN 'crisis'  THEN 'crisis_campaigns'
    WHEN 'talent'  THEN 'talent_campaigns'
    ELSE NULL
  END;
  IF _table IS NULL THEN RETURN FALSE; END IF;

  EXECUTE format('SELECT user_id FROM public.%I WHERE id = $1', _table)
    INTO _owner USING _campaign_id;

  RETURN _owner = _user_id;
END;
$$;