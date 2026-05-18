
CREATE TABLE IF NOT EXISTS public.reincarnation_parity_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reincarnation_parity_credits ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "own credits select" ON public.reincarnation_parity_credits FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "own credits insert" ON public.reincarnation_parity_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'reincarnation_parity_soul_origins',
    'reincarnation_parity_karmic_threads',
    'reincarnation_parity_timelines',
    'reincarnation_parity_soul_contracts',
    'reincarnation_parity_past_life_letters',
    'reincarnation_parity_dharma_paths',
    'reincarnation_parity_twin_flame_reports',
    'reincarnation_parity_rebirth_blueprints'
  ]) LOOP
    EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      input JSONB NOT NULL DEFAULT ''{}''::jsonb,
      result JSONB NOT NULL DEFAULT ''{}''::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    BEGIN
      EXECUTE format('CREATE POLICY "own select" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE format('CREATE POLICY "own insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END$$;
