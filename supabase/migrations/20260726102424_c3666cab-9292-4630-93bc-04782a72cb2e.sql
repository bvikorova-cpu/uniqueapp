CREATE TABLE IF NOT EXISTS public.kids_gold_pass_status (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  status TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kids_gold_pass_status TO authenticated;
GRANT ALL ON public.kids_gold_pass_status TO service_role;

ALTER TABLE public.kids_gold_pass_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own gold pass status" ON public.kids_gold_pass_status;
CREATE POLICY "Users read own gold pass status"
  ON public.kids_gold_pass_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS kids_gold_pass_status_active_idx
  ON public.kids_gold_pass_status (user_id) WHERE active = true;

-- Realtime so the frontend gate can react instantly to webhook writes.
ALTER PUBLICATION supabase_realtime ADD TABLE public.kids_gold_pass_status;