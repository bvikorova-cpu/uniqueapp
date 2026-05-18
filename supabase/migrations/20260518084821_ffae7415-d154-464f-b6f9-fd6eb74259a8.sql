-- Credits table
CREATE TABLE public.property_parity_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_parity_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own ppc" ON public.property_parity_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service all ppc" ON public.property_parity_credits FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Helper for tool tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_ppc_updated BEFORE UPDATE ON public.property_parity_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generic creator function for tool tables
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'property_parity_listing_optimizers',
    'property_parity_pricing_strategies',
    'property_parity_buyer_personas',
    'property_parity_negotiation_coaches',
    'property_parity_staging_briefs',
    'property_parity_neighborhood_pitches',
    'property_parity_rental_yields',
    'property_parity_legal_checklists'
  ]
  LOOP
    EXECUTE format('
      CREATE TABLE public.%I (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        input JSONB NOT NULL DEFAULT ''{}''::jsonb,
        result JSONB NOT NULL DEFAULT ''{}''::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "u view own" ON public.%I FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "u insert own" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "u delete own" ON public.%I FOR DELETE USING (auth.uid() = user_id);
      CREATE POLICY "svc all" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'');
      CREATE INDEX %I ON public.%I(user_id, created_at DESC);
    ', t, t, t, t, t, t, t || '_user_idx', t);
  END LOOP;
END $$;