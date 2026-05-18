CREATE TABLE public.dna_parity_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  credits_spent integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dna_parity_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own dna credits" ON public.dna_parity_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own dna credits" ON public.dna_parity_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'dna_parity_ancestral_stories',
    'dna_parity_heritage_maps',
    'dna_parity_compatibility_reports',
    'dna_parity_offspring_predictions',
    'dna_parity_health_blueprints',
    'dna_parity_art_prompts',
    'dna_parity_voice_scripts',
    'dna_parity_tree_narratives'
  ]) LOOP
    EXECUTE format('CREATE TABLE public.%I (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      input jsonb NOT NULL DEFAULT ''{}''::jsonb,
      result jsonb NOT NULL DEFAULT ''{}''::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "users view own" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
    EXECUTE format('CREATE POLICY "users insert own" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
  END LOOP;
END $$;