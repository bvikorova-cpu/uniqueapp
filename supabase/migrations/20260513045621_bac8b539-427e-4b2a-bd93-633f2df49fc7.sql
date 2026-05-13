-- Phase 5: Auto-withdraw rules + multi-currency wallet snapshots

CREATE TABLE IF NOT EXISTS public.auto_withdraw_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  threshold_eur NUMERIC(10,2) NOT NULL DEFAULT 100,
  min_balance_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  preferred_method TEXT NOT NULL DEFAULT 'stripe_connect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_withdraw_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own auto-withdraw" ON public.auto_withdraw_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own wallet" ON public.wallet_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.tax_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  form_type TEXT NOT NULL,
  full_name TEXT,
  tax_id TEXT,
  country TEXT,
  vat_id TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own tax form" ON public.tax_forms
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_auto_withdraw_updated BEFORE UPDATE ON public.auto_withdraw_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_tax_forms_updated BEFORE UPDATE ON public.tax_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();