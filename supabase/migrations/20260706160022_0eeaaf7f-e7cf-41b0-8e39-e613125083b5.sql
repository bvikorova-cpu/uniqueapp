CREATE TABLE IF NOT EXISTS public.investment_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  avg_cost_eur NUMERIC NOT NULL DEFAULT 0,
  current_price_eur NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investment_holdings TO authenticated;
GRANT ALL ON public.investment_holdings TO service_role;

ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own investment holdings"
  ON public.investment_holdings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_investment_holdings_updated_at
  BEFORE UPDATE ON public.investment_holdings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_investment_holdings_user ON public.investment_holdings(user_id);