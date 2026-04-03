
-- Hockey Coins
CREATE TABLE public.hockey_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.hockey_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey coins" ON public.hockey_coins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hockey Players
CREATE TABLE public.hockey_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'Center',
  skating INTEGER NOT NULL DEFAULT 50,
  shooting INTEGER NOT NULL DEFAULT 50,
  passing INTEGER NOT NULL DEFAULT 50,
  defense INTEGER NOT NULL DEFAULT 50,
  physicality INTEGER NOT NULL DEFAULT 50,
  goaltending INTEGER NOT NULL DEFAULT 30,
  speed INTEGER NOT NULL DEFAULT 50,
  stamina INTEGER NOT NULL DEFAULT 50,
  overall_rating INTEGER NOT NULL DEFAULT 50,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  is_for_sale BOOLEAN NOT NULL DEFAULT false,
  market_value INTEGER NOT NULL DEFAULT 1000,
  sale_price INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey players" ON public.hockey_players FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all hockey players for sale" ON public.hockey_players FOR SELECT USING (is_for_sale = true);

-- Hockey Teams
CREATE TABLE public.hockey_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  playstyle TEXT NOT NULL DEFAULT 'balanced',
  logo_url TEXT,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  league_points INTEGER NOT NULL DEFAULT 0,
  stadium_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.hockey_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey team" ON public.hockey_teams FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all hockey teams" ON public.hockey_teams FOR SELECT USING (true);

-- Hockey Matches
CREATE TABLE public.hockey_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.hockey_teams(id),
  away_team_id UUID REFERENCES public.hockey_teams(id),
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  period_scores JSONB,
  coins_reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all hockey matches" ON public.hockey_matches FOR SELECT USING (true);
CREATE POLICY "Users can create hockey matches" ON public.hockey_matches FOR INSERT WITH CHECK (true);

-- Hockey Equipment
CREATE TABLE public.hockey_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.hockey_players(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  price INTEGER NOT NULL DEFAULT 100,
  skating_boost INTEGER NOT NULL DEFAULT 0,
  shooting_boost INTEGER NOT NULL DEFAULT 0,
  defense_boost INTEGER NOT NULL DEFAULT 0,
  speed_boost INTEGER NOT NULL DEFAULT 0,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey equipment" ON public.hockey_equipment FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hockey Training Sessions
CREATE TABLE public.hockey_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.hockey_players(id),
  training_type TEXT NOT NULL,
  stat_improved TEXT NOT NULL,
  improvement_amount INTEGER NOT NULL DEFAULT 1,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey training" ON public.hockey_training_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hockey Leagues
CREATE TABLE public.hockey_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  entry_fee INTEGER NOT NULL DEFAULT 0,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  max_teams INTEGER NOT NULL DEFAULT 16,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hockey leagues" ON public.hockey_leagues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hockey leagues" ON public.hockey_leagues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Hockey League Standings
CREATE TABLE public.hockey_league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.hockey_leagues(id),
  team_id UUID REFERENCES public.hockey_teams(id),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hockey standings" ON public.hockey_league_standings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage hockey standings" ON public.hockey_league_standings FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Hockey Transfers
CREATE TABLE public.hockey_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.hockey_players(id),
  seller_id UUID NOT NULL,
  buyer_id UUID,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hockey_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hockey transfers" ON public.hockey_transfers FOR SELECT USING (true);
CREATE POLICY "Users can create own hockey transfers" ON public.hockey_transfers FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own hockey transfers" ON public.hockey_transfers FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Hockey Stadiums
CREATE TABLE public.hockey_stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Arena',
  capacity INTEGER NOT NULL DEFAULT 5000,
  ice_type TEXT NOT NULL DEFAULT 'standard',
  facilities_level INTEGER NOT NULL DEFAULT 1,
  revenue_per_match INTEGER NOT NULL DEFAULT 100,
  total_upgrades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.hockey_stadiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hockey stadium" ON public.hockey_stadiums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
