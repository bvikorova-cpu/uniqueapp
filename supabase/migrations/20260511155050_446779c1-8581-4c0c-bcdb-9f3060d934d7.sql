CREATE TABLE IF NOT EXISTS public.iq_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iq_sub_user ON public.iq_subscriptions(user_id);

ALTER TABLE public.iq_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own iq sub" ON public.iq_subscriptions;
CREATE POLICY "Users view own iq sub"
ON public.iq_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_iq_pro(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.iq_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND tier IN ('pro','elite')
      AND (current_period_end IS NULL OR current_period_end > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.update_iq_sub_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_iq_sub_updated ON public.iq_subscriptions;
CREATE TRIGGER trg_iq_sub_updated
BEFORE UPDATE ON public.iq_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_iq_sub_updated();