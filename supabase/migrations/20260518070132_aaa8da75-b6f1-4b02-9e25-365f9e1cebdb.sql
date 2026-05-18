
-- Credits table
CREATE TABLE public.lottery_parity_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  credits_remaining integer NOT NULL DEFAULT 0,
  total_purchased integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lottery_parity_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lpc_select_own" ON public.lottery_parity_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lpc_insert_own" ON public.lottery_parity_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lpc_update_own" ON public.lottery_parity_credits FOR UPDATE USING (auth.uid() = user_id);

-- Tool tables helper
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'lottery_parity_wheel_builders',
    'lottery_parity_syndicate_strategies',
    'lottery_parity_tax_planners',
    'lottery_parity_claim_checklists',
    'lottery_parity_budget_coaches',
    'lottery_parity_lucky_charms',
    'lottery_parity_pattern_detectors',
    'lottery_parity_winner_mindsets'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format($f$
      CREATE TABLE public.%I (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        credits_used integer NOT NULL DEFAULT 0,
        input jsonb NOT NULL DEFAULT '{}'::jsonb,
        result jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "own_select" ON public.%I FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "own_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE INDEX %I ON public.%I(user_id, created_at DESC);
    $f$, t, t, t, t, t || '_user_idx', t);
  END LOOP;
END $$;
