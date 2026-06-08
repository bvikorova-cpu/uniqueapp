
-- Teen credits (jednotný kreditný balans pre všetky Teen AI moduly)
CREATE TABLE IF NOT EXISTS public.teen_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teen_credits TO authenticated;
GRANT ALL ON public.teen_credits TO service_role;
ALTER TABLE public.teen_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own teen credits" ON public.teen_credits
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Teen module usage log (parental visibility)
CREATE TABLE IF NOT EXISTS public.teen_module_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.teen_module_usage TO authenticated;
GRANT ALL ON public.teen_module_usage TO service_role;
ALTER TABLE public.teen_module_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own teen usage" ON public.teen_module_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own teen usage" ON public.teen_module_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_teen_usage_user_created ON public.teen_module_usage(user_id, created_at DESC);

-- Teen module visits
CREATE TABLE IF NOT EXISTS public.teen_module_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module TEXT NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1,
  last_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module)
);
GRANT SELECT, INSERT, UPDATE ON public.teen_module_visits TO authenticated;
GRANT ALL ON public.teen_module_visits TO service_role;
ALTER TABLE public.teen_module_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own teen visits" ON public.teen_module_visits
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_teen_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_teen_credits_updated ON public.teen_credits;
CREATE TRIGGER trg_teen_credits_updated BEFORE UPDATE ON public.teen_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_teen_updated_at();
