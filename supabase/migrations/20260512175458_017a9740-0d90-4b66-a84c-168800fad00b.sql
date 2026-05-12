
CREATE TABLE IF NOT EXISTS public.ai_credits_auto_recharge (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  threshold integer NOT NULL DEFAULT 10,
  package_credits integer NOT NULL DEFAULT 25,
  package_price_eur numeric(10,2) NOT NULL DEFAULT 10.00,
  stripe_customer_id text,
  stripe_payment_method_id text,
  last_recharge_at timestamptz,
  last_recharge_status text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_credits_auto_recharge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ar_select_own" ON public.ai_credits_auto_recharge
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "ar_insert_own" ON public.ai_credits_auto_recharge
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ar_update_own" ON public.ai_credits_auto_recharge
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ar_delete_own" ON public.ai_credits_auto_recharge
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.tg_ar_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS ar_touch ON public.ai_credits_auto_recharge;
CREATE TRIGGER ar_touch BEFORE UPDATE ON public.ai_credits_auto_recharge
  FOR EACH ROW EXECUTE FUNCTION public.tg_ar_touch_updated_at();
