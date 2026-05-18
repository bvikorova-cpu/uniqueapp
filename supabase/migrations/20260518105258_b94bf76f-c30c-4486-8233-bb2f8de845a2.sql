
CREATE TABLE public.crystal_parity_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crystal_parity_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.crystal_parity_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.crystal_parity_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'crystal_parity_birth_chart_crystals',
    'crystal_parity_ritual_designers',
    'crystal_parity_grid_layouts',
    'crystal_parity_dream_decoders',
    'crystal_parity_affirmation_packs',
    'crystal_parity_intention_setters',
    'crystal_parity_aura_color_coaches',
    'crystal_parity_space_clearings'
  ] LOOP
    EXECUTE format('CREATE TABLE public.%I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      input JSONB NOT NULL DEFAULT ''{}''::jsonb,
      result JSONB NOT NULL DEFAULT ''{}''::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "own select" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "own insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "own delete" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t);
  END LOOP;
END $$;
