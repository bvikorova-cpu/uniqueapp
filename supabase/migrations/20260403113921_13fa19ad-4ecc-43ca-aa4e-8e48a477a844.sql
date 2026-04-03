
-- Create emotion roulette spins table
CREATE TABLE public.emotion_roulette_spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bet_emotion TEXT NOT NULL,
  bet_amount INTEGER NOT NULL DEFAULT 1,
  result_emotion TEXT NOT NULL,
  won BOOLEAN NOT NULL DEFAULT false,
  payout INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emotion_roulette_spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spins" ON public.emotion_roulette_spins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spins" ON public.emotion_roulette_spins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create emotion futures bets table
CREATE TABLE public.emotion_futures_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emotion_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  amount INTEGER NOT NULL DEFAULT 2,
  resolution_date DATE NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  outcome TEXT DEFAULT NULL,
  payout INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emotion_futures_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets" ON public.emotion_futures_bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets" ON public.emotion_futures_bets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for leaderboard queries
CREATE INDEX idx_emotion_roulette_user ON public.emotion_roulette_spins(user_id);
CREATE INDEX idx_emotion_futures_user ON public.emotion_futures_bets(user_id);
CREATE INDEX idx_emotion_futures_resolution ON public.emotion_futures_bets(resolution_date, resolved);
