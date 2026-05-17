
-- Add refund tracking columns to campaign_donations
ALTER TABLE public.campaign_donations
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2);

-- RPC: refund a donation by its stripe_payment_id (PaymentIntent),
-- decrements the corresponding campaign's current_amount by the net_amount
-- and flips the donation row to 'refunded'. Idempotent: re-running for an
-- already-refunded donation is a no-op.
CREATE OR REPLACE FUNCTION public.refund_campaign_donation(
  _stripe_payment_id text,
  _stripe_refund_id text,
  _refund_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _d record;
  _table text;
BEGIN
  SELECT id, campaign_id, campaign_type, net_amount, status
    INTO _d
    FROM public.campaign_donations
   WHERE stripe_payment_id = _stripe_payment_id
   LIMIT 1;

  IF _d.id IS NULL THEN
    RETURN jsonb_build_object('status','not_found');
  END IF;
  IF _d.status = 'refunded' THEN
    RETURN jsonb_build_object('status','already_refunded','donation_id',_d.id);
  END IF;

  UPDATE public.campaign_donations
     SET status = 'refunded',
         refunded_at = now(),
         stripe_refund_id = _stripe_refund_id,
         refund_amount = COALESCE(_refund_amount, net_amount)
   WHERE id = _d.id;

  _table := CASE _d.campaign_type
    WHEN 'medical' THEN 'medical_campaigns'
    WHEN 'dream'   THEN 'dream_campaigns'
    WHEN 'hero'    THEN 'hero_campaigns'
    WHEN 'pet'     THEN 'pet_rescue_campaigns'
    WHEN 'student' THEN 'student_campaigns'
    WHEN 'crisis'  THEN 'crisis_campaigns'
    WHEN 'talent'  THEN 'talent_campaigns'
  END;

  IF _table IS NOT NULL THEN
    EXECUTE format(
      'UPDATE public.%I SET current_amount = GREATEST(COALESCE(current_amount,0) - $1, 0) WHERE id = $2',
      _table
    ) USING _d.net_amount, _d.campaign_id;
  END IF;

  RETURN jsonb_build_object('status','refunded','donation_id',_d.id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refund_campaign_donation(text, text, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_campaign_donation(text, text, numeric) TO service_role;
