
-- American Football Players
CREATE TABLE public.american_football_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'QB',
  overall_rating INTEGER NOT NULL DEFAULT 50,
  throwing INTEGER NOT NULL DEFAULT 50,
  catching INTEGER NOT NULL DEFAULT 50,
  rushing INTEGER NOT NULL DEFAULT 50,
  blocking INTEGER NOT NULL DEFAULT 50,
  tackling INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  stamina INTEGER NOT NULL DEFAULT 50,
  games_played INTEGER NOT NULL DEFAULT 0,
  touchdowns INTEGER NOT NULL DEFAULT 0,
  yards_gained INTEGER NOT NULL DEFAULT 0,
  tackles_made INTEGER NOT NULL DEFAULT 0,
  is_starter BOOLEAN NOT NULL DEFAULT false,
  is_for_sale BOOLEAN NOT NULL DEFAULT false,
  sale_price INTEGER,
  market_value INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af players" ON public.american_football_players FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- American Football Teams
CREATE TABLE public.american_football_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  playstyle TEXT NOT NULL DEFAULT 'Balanced',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  league_points INTEGER NOT NULL DEFAULT 0,
  logo_url TEXT,
  stadium_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af teams" ON public.american_football_teams FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- American Football Matches
CREATE TABLE public.american_football_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.american_football_teams(id),
  away_team_id UUID REFERENCES public.american_football_teams(id),
  home_score INTEGER NOT NULL DEFAULT 0,
  away_score INTEGER NOT NULL DEFAULT 0,
  quarter_scores JSONB,
  coins_reward INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view af matches" ON public.american_football_matches FOR SELECT USING (true);
CREATE POLICY "Users manage af matches" ON public.american_football_matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.american_football_teams WHERE id = home_team_id AND user_id = auth.uid())
);

-- American Football Leagues
CREATE TABLE public.american_football_leagues (
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
ALTER TABLE public.american_football_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view af leagues" ON public.american_football_leagues FOR SELECT USING (true);

-- American Football League Standings
CREATE TABLE public.american_football_league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.american_football_leagues(id),
  team_id UUID REFERENCES public.american_football_teams(id),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view af standings" ON public.american_football_league_standings FOR SELECT USING (true);

-- American Football Equipment
CREATE TABLE public.american_football_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.american_football_players(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  throwing_boost INTEGER NOT NULL DEFAULT 0,
  rushing_boost INTEGER NOT NULL DEFAULT 0,
  blocking_boost INTEGER NOT NULL DEFAULT 0,
  speed_boost INTEGER NOT NULL DEFAULT 0,
  stamina_boost INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 100,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af equipment" ON public.american_football_equipment FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- American Football Training Sessions
CREATE TABLE public.american_football_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.american_football_players(id),
  training_type TEXT NOT NULL,
  stat_improved TEXT NOT NULL,
  improvement_amount INTEGER NOT NULL DEFAULT 1,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af training" ON public.american_football_training_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- American Football Transfers
CREATE TABLE public.american_football_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES public.american_football_players(id),
  seller_id UUID NOT NULL,
  buyer_id UUID,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view af transfers" ON public.american_football_transfers FOR SELECT USING (true);
CREATE POLICY "Sellers manage af transfers" ON public.american_football_transfers FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Buyers update af transfers" ON public.american_football_transfers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- American Football Stadiums
CREATE TABLE public.american_football_stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Stadium',
  capacity INTEGER NOT NULL DEFAULT 5000,
  field_type TEXT NOT NULL DEFAULT 'grass',
  facilities_level INTEGER NOT NULL DEFAULT 1,
  revenue_per_match INTEGER NOT NULL DEFAULT 100,
  total_upgrades INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_stadiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af stadiums" ON public.american_football_stadiums FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- American Football Coins
CREATE TABLE public.american_football_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 1000,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.american_football_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own af coins" ON public.american_football_coins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
