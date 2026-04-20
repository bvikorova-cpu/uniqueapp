
-- Global payout methods table
CREATE TYPE public.payout_method_type AS ENUM (
  'iban', 'paypal', 'wise', 'crypto', 'stripe_connect', 'payoneer', 'revolut'
);

CREATE TABLE public.payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type public.payout_method_type NOT NULL,
  label TEXT,
  account_holder TEXT,
  account_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  currency TEXT DEFAULT 'EUR',
  country TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payout_methods_user ON public.payout_methods(user_id);

ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payout methods"
  ON public.payout_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own payout methods"
  ON public.payout_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own payout methods"
  ON public.payout_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own payout methods"
  ON public.payout_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure only one default per user
CREATE OR REPLACE FUNCTION public.enforce_single_default_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.payout_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id <> NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_single_default_payout
  BEFORE INSERT OR UPDATE ON public.payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_default_payout();

CREATE TRIGGER trg_payout_methods_updated_at
  BEFORE UPDATE ON public.payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
