
-- Holographic battle & breeding result tables for in-app gameplay simulation
CREATE TABLE public.holographic_battle_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL,
  opponent_name text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('win','loss','draw')),
  user_power int NOT NULL,
  opponent_power int NOT NULL,
  rewards_eur numeric(10,2) NOT NULL DEFAULT 0,
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.holographic_battle_results TO authenticated;
GRANT ALL ON public.holographic_battle_results TO service_role;
ALTER TABLE public.holographic_battle_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own battle results" ON public.holographic_battle_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own battle results" ON public.holographic_battle_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.holographic_breeding_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  parent1_id int NOT NULL,
  parent2_id int NOT NULL,
  offspring_name text NOT NULL,
  offspring_style text NOT NULL,
  offspring_traits jsonb NOT NULL DEFAULT '[]'::jsonb,
  offspring_level int NOT NULL DEFAULT 1,
  rarity text NOT NULL,
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.holographic_breeding_results TO authenticated;
GRANT ALL ON public.holographic_breeding_results TO service_role;
ALTER TABLE public.holographic_breeding_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own breeding results" ON public.holographic_breeding_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own breeding results" ON public.holographic_breeding_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
