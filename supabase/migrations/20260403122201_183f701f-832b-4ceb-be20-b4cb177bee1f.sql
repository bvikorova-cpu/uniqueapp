
-- Quantum NFTs
CREATE TABLE public.quantum_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  image_url TEXT,
  quantum_signature TEXT,
  minted_price NUMERIC DEFAULT 0,
  is_listed BOOLEAN DEFAULT false,
  listed_price NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_nfts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view NFTs" ON public.quantum_nfts FOR SELECT USING (true);
CREATE POLICY "Users create own NFTs" ON public.quantum_nfts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own NFTs" ON public.quantum_nfts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own NFTs" ON public.quantum_nfts FOR DELETE USING (auth.uid() = user_id);

-- NFT Transactions
CREATE TABLE public.quantum_nft_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES public.quantum_nfts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID,
  price NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'mint',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_nft_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.quantum_nft_transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users create transactions" ON public.quantum_nft_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Reality Merges
CREATE TABLE public.quantum_reality_merges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_post_ids UUID[] NOT NULL,
  merged_content TEXT NOT NULL,
  merge_type TEXT DEFAULT 'hybrid',
  votes_count INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_reality_merges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view merges" ON public.quantum_reality_merges FOR SELECT USING (true);
CREATE POLICY "Users create merges" ON public.quantum_reality_merges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own merges" ON public.quantum_reality_merges FOR UPDATE USING (auth.uid() = user_id);

-- Tournaments
CREATE TABLE public.quantum_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  max_participants INT DEFAULT 64,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view tournaments" ON public.quantum_tournaments FOR SELECT USING (true);

-- Tournament Participants
CREATE TABLE public.quantum_tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.quantum_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INT DEFAULT 0,
  rank INT,
  rounds_completed INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.quantum_tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view participants" ON public.quantum_tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users join tournaments" ON public.quantum_tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own participation" ON public.quantum_tournament_participants FOR UPDATE USING (auth.uid() = user_id);

-- Observer Leaderboard
CREATE TABLE public.quantum_observer_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  observations_count INT DEFAULT 0,
  accuracy_score NUMERIC DEFAULT 0,
  streak_days INT DEFAULT 0,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_observer_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view leaderboard" ON public.quantum_observer_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users create own entry" ON public.quantum_observer_leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own entry" ON public.quantum_observer_leaderboard FOR UPDATE USING (auth.uid() = user_id);

-- Time Travel Logs
CREATE TABLE public.quantum_time_travel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_post_id UUID,
  viewed_version INT DEFAULT 1,
  timeline_branch TEXT DEFAULT 'alpha',
  credits_used INT DEFAULT 1,
  traveled_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_time_travel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logs" ON public.quantum_time_travel_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create logs" ON public.quantum_time_travel_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed tournaments
INSERT INTO public.quantum_tournaments (name, description, entry_fee, prize_pool, status, max_participants, starts_at, ends_at) VALUES
('Quantum Collapse Championship', 'Compete to collapse the most realities in record time. Top observers win massive quantum points!', 2, 500, 'active', 64, now(), now() + interval '7 days'),
('Superposition Sprint', 'Speed-run through quantum states — observe, collapse, and score before time runs out!', 1, 200, 'upcoming', 32, now() + interval '3 days', now() + interval '10 days'),
('Entanglement Masters Cup', 'Build the strongest entanglement network. Most connections wins the dimensional trophy!', 3, 1000, 'upcoming', 128, now() + interval '7 days', now() + interval '21 days'),
('Reality Merge Showdown', 'Create the most creative reality merges. Community votes determine the winner!', 2, 750, 'active', 48, now(), now() + interval '14 days');
