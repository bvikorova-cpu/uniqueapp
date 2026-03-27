CREATE TABLE IF NOT EXISTS public.brain_duel_daily_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spin_date date NOT NULL DEFAULT CURRENT_DATE,
  reward_type text NOT NULL DEFAULT 'credits',
  reward_value integer NOT NULL DEFAULT 0,
  reward_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, spin_date)
);

ALTER TABLE public.brain_duel_daily_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own spins" ON public.brain_duel_daily_spins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spins" ON public.brain_duel_daily_spins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);