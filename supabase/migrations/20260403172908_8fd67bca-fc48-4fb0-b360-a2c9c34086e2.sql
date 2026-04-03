
-- Tennis Players
CREATE TABLE public.tennis_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'singles',
  serve INTEGER NOT NULL DEFAULT 50,
  forehand INTEGER NOT NULL DEFAULT 50,
  backhand INTEGER NOT NULL DEFAULT 50,
  volley INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  stamina INTEGER NOT NULL DEFAULT 50,
  overall_rating INTEGER NOT NULL DEFAULT 50,
  market_value INTEGER NOT NULL DEFAULT 1000,
  is_for_sale BOOLEAN NOT NULL DEFAULT false,
  sale_price INTEGER,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  games_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  aces INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis players" ON public.tennis_players FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tennis Teams
CREATE TABLE public.tennis_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  playstyle TEXT NOT NULL DEFAULT 'baseline',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  league_points INTEGER NOT NULL DEFAULT 0,
  stadium_level INTEGER NOT NULL DEFAULT 1,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis teams" ON public.tennis_teams FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tennis Matches
CREATE TABLE public.tennis_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.tennis_teams(id),
  away_team_id UUID REFERENCES public.tennis_teams(id),
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  set_scores JSONB,
  coins_reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tennis matches" ON public.tennis_matches FOR SELECT USING (
  home_team_id IN (SELECT id FROM public.tennis_teams WHERE user_id = auth.uid()) OR
  away_team_id IN (SELECT id FROM public.tennis_teams WHERE user_id = auth.uid())
);
CREATE POLICY "Users insert own tennis matches" ON public.tennis_matches FOR INSERT WITH CHECK (
  home_team_id IN (SELECT id FROM public.tennis_teams WHERE user_id = auth.uid())
);

-- Tennis Leagues
CREATE TABLE public.tennis_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  max_teams INTEGER NOT NULL DEFAULT 16,
  entry_fee INTEGER NOT NULL DEFAULT 500,
  prize_pool INTEGER NOT NULL DEFAULT 5000,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tennis leagues" ON public.tennis_leagues FOR SELECT USING (true);

-- Tennis Equipment
CREATE TABLE public.tennis_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.tennis_players(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  serve_boost INTEGER NOT NULL DEFAULT 0,
  speed_boost INTEGER NOT NULL DEFAULT 0,
  stamina_boost INTEGER NOT NULL DEFAULT 0,
  accuracy_boost INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 100,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis equipment" ON public.tennis_equipment FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tennis Training
CREATE TABLE public.tennis_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.tennis_players(id),
  training_type TEXT NOT NULL,
  stat_improved TEXT NOT NULL,
  improvement_amount INTEGER NOT NULL DEFAULT 1,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis training" ON public.tennis_training_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tennis League Standings
CREATE TABLE public.tennis_league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.tennis_leagues(id),
  team_id UUID REFERENCES public.tennis_teams(id),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tennis standings" ON public.tennis_league_standings FOR SELECT USING (true);
CREATE POLICY "Users manage own tennis standings" ON public.tennis_league_standings FOR INSERT WITH CHECK (
  team_id IN (SELECT id FROM public.tennis_teams WHERE user_id = auth.uid())
);

-- Tennis Transfers
CREATE TABLE public.tennis_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID,
  player_id UUID REFERENCES public.tennis_players(id),
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view all tennis transfers" ON public.tennis_transfers FOR SELECT USING (true);
CREATE POLICY "Users manage own tennis transfers" ON public.tennis_transfers FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users update own tennis transfers" ON public.tennis_transfers FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Tennis Stadiums
CREATE TABLE public.tennis_stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Tennis Center',
  capacity INTEGER NOT NULL DEFAULT 1000,
  court_type TEXT NOT NULL DEFAULT 'hard',
  facilities_level INTEGER NOT NULL DEFAULT 1,
  revenue_per_match INTEGER NOT NULL DEFAULT 100,
  total_upgrades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_stadiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis stadiums" ON public.tennis_stadiums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tennis Coins
CREATE TABLE public.tennis_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tennis_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tennis coins" ON public.tennis_coins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
