
-- horse_race_entries
CREATE TABLE IF NOT EXISTS public.horse_race_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('buy-horse','enter-race','train')),
  horse_name TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.horse_race_entries TO authenticated;
GRANT ALL ON public.horse_race_entries TO service_role;
ALTER TABLE public.horse_race_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own horse entries" ON public.horse_race_entries;
CREATE POLICY "Users manage own horse entries" ON public.horse_race_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_horse_entries_user ON public.horse_race_entries(user_id, created_at DESC);

-- gp_race_entries
CREATE TABLE IF NOT EXISTS public.gp_race_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('buy-car','join-race','shop-purchase')),
  item_name TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.gp_race_entries TO authenticated;
GRANT ALL ON public.gp_race_entries TO service_role;
ALTER TABLE public.gp_race_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own gp entries" ON public.gp_race_entries;
CREATE POLICY "Users manage own gp entries" ON public.gp_race_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_gp_entries_user ON public.gp_race_entries(user_id, created_at DESC);

-- lottery_saved_picks
CREATE TABLE IF NOT EXISTS public.lottery_saved_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  numbers INTEGER[] NOT NULL,
  bonus_numbers INTEGER[],
  label TEXT,
  submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lottery_saved_picks TO authenticated;
GRANT ALL ON public.lottery_saved_picks TO service_role;
ALTER TABLE public.lottery_saved_picks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own lottery picks" ON public.lottery_saved_picks;
CREATE POLICY "Users manage own lottery picks" ON public.lottery_saved_picks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_picks_user ON public.lottery_saved_picks(user_id, created_at DESC);

-- phobia_trade_actions (existing phobia_trades has different purpose)
CREATE TABLE IF NOT EXISTS public.phobia_trade_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('place-trade','write-journal')),
  phobia_symbol TEXT,
  direction TEXT CHECK (direction IN ('long','short') OR direction IS NULL),
  amount NUMERIC(12,2),
  journal_entry TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.phobia_trade_actions TO authenticated;
GRANT ALL ON public.phobia_trade_actions TO service_role;
ALTER TABLE public.phobia_trade_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own phobia actions" ON public.phobia_trade_actions;
CREATE POLICY "Users manage own phobia actions" ON public.phobia_trade_actions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_phobia_actions_user ON public.phobia_trade_actions(user_id, created_at DESC);
