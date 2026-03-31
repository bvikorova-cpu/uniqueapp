-- Dream Interpretation Battles tables
CREATE TABLE IF NOT EXISTS public.dream_battle_dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dream_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dream_battle_interpretations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id uuid REFERENCES public.dream_battle_dreams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  interpretation_text text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dream_mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood_score integer NOT NULL,
  mood_label text,
  energy_level integer,
  stress_level integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dream_battle_dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_battle_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all battle dreams" ON public.dream_battle_dreams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own battle dreams" ON public.dream_battle_dreams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all interpretations" ON public.dream_battle_interpretations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own interpretations" ON public.dream_battle_interpretations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update interpretation votes" ON public.dream_battle_interpretations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read own mood entries" ON public.dream_mood_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON public.dream_mood_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);