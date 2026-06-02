
ALTER TABLE public.profile_tips
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recipient_amount_cents integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_transfer_id text,
  ADD COLUMN IF NOT EXISTS destination_account_id text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Backfill cents from legacy amount column
UPDATE public.profile_tips
SET amount_cents = COALESCE(amount_cents, ROUND(amount * 100)::int)
WHERE amount_cents IS NULL;

-- Validation trigger: 1..100 EUR, sender != recipient, status enum
CREATE OR REPLACE FUNCTION public.validate_profile_tip()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.amount_cents IS NULL OR NEW.amount_cents < 100 OR NEW.amount_cents > 10000 THEN
    RAISE EXCEPTION 'Tip amount must be between €1 and €100';
  END IF;
  IF NEW.sender_id = NEW.recipient_id THEN
    RAISE EXCEPTION 'Cannot tip yourself';
  END IF;
  IF NEW.status NOT IN ('pending','completed','refunded','failed') THEN
    RAISE EXCEPTION 'Invalid status %', NEW.status;
  END IF;
  IF NEW.platform_fee_cents < 0 OR NEW.platform_fee_cents > NEW.amount_cents THEN
    RAISE EXCEPTION 'Invalid platform fee';
  END IF;
  IF NEW.recipient_amount_cents IS NULL THEN
    NEW.recipient_amount_cents := NEW.amount_cents - NEW.platform_fee_cents;
  END IF;
  IF NEW.amount IS NULL THEN
    NEW.amount := NEW.amount_cents::numeric / 100;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_profile_tip ON public.profile_tips;
CREATE TRIGGER trg_validate_profile_tip
BEFORE INSERT OR UPDATE ON public.profile_tips
FOR EACH ROW EXECUTE FUNCTION public.validate_profile_tip();

CREATE INDEX IF NOT EXISTS idx_profile_tips_recipient_status ON public.profile_tips(recipient_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_tips_sender ON public.profile_tips(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_tips_session ON public.profile_tips(stripe_session_id);

-- Stats helper view function for fast totals
CREATE OR REPLACE FUNCTION public.get_profile_tip_stats(_recipient uuid)
RETURNS TABLE(total_count bigint, total_amount_cents bigint, total_recipient_cents bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint,
         COALESCE(SUM(amount_cents),0)::bigint,
         COALESCE(SUM(recipient_amount_cents),0)::bigint
  FROM public.profile_tips
  WHERE recipient_id = _recipient AND status = 'completed';
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_tip_stats(uuid) TO anon, authenticated;
