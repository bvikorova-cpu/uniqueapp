
-- Football coins (in-game currency)
CREATE TABLE public.football_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.football_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_coins_select" ON public.football_coins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "football_coins_insert" ON public.football_coins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "football_coins_update" ON public.football_coins FOR UPDATE USING (auth.uid() = user_id);

-- Football players
CREATE TABLE public.football_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'ST',
  overall_rating INTEGER NOT NULL DEFAULT 50,
  pace INTEGER NOT NULL DEFAULT 50,
  shooting INTEGER NOT NULL DEFAULT 50,
  passing INTEGER NOT NULL DEFAULT 50,
  defending INTEGER NOT NULL DEFAULT 50,
  physical INTEGER NOT NULL DEFAULT 50,
  stamina INTEGER NOT NULL DEFAULT 100,
  morale INTEGER NOT NULL DEFAULT 80,
  market_value INTEGER NOT NULL DEFAULT 1000,
  is_for_sale BOOLEAN NOT NULL DEFAULT false,
  sale_price INTEGER DEFAULT NULL,
  team_id UUID DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.football_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_players_select" ON public.football_players FOR SELECT USING (true);
CREATE POLICY "football_players_insert" ON public.football_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "football_players_update" ON public.football_players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "football_players_delete" ON public.football_players FOR DELETE USING (auth.uid() = user_id);

-- Football teams
CREATE TABLE public.football_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  formation TEXT NOT NULL DEFAULT '4-3-3',
  logo_url TEXT DEFAULT NULL,
  stadium_name TEXT DEFAULT 'Default Stadium',
  league_rank INTEGER DEFAULT NULL,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.football_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_teams_select" ON public.football_teams FOR SELECT USING (true);
CREATE POLICY "football_teams_insert" ON public.football_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "football_teams_update" ON public.football_teams FOR UPDATE USING (auth.uid() = user_id);

-- Football matches
CREATE TABLE public.football_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  match_type TEXT NOT NULL DEFAULT 'friendly',
  match_log JSONB DEFAULT '[]'::jsonb,
  played_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.football_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_matches_select" ON public.football_matches FOR SELECT USING (true);
CREATE POLICY "football_matches_insert" ON public.football_matches FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.football_teams WHERE id = home_team_id)
);
CREATE POLICY "football_matches_update" ON public.football_matches FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.football_teams WHERE id IN (home_team_id, away_team_id))
);

-- Football equipment
CREATE TABLE public.football_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'boots',
  boost_stat TEXT DEFAULT NULL,
  boost_value INTEGER DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 100,
  rarity TEXT NOT NULL DEFAULT 'common',
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  player_id UUID DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.football_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_equipment_select" ON public.football_equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "football_equipment_insert" ON public.football_equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "football_equipment_update" ON public.football_equipment FOR UPDATE USING (auth.uid() = user_id);

-- Football training sessions
CREATE TABLE public.football_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES public.football_players(id) ON DELETE CASCADE,
  training_type TEXT NOT NULL,
  stat_improved TEXT NOT NULL,
  improvement_value INTEGER NOT NULL DEFAULT 1,
  credits_used INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.football_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_training_select" ON public.football_training_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "football_training_insert" ON public.football_training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Football leagues
CREATE TABLE public.football_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season TEXT NOT NULL DEFAULT 'Season 1',
  entry_fee INTEGER NOT NULL DEFAULT 500,
  prize_pool INTEGER NOT NULL DEFAULT 5000,
  max_teams INTEGER NOT NULL DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'open',
  starts_at TIMESTAMPTZ DEFAULT NULL,
  ends_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.football_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_leagues_select" ON public.football_leagues FOR SELECT USING (true);

-- Football league standings
CREATE TABLE public.football_league_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES public.football_leagues(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(league_id, team_id)
);
ALTER TABLE public.football_league_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_standings_select" ON public.football_league_standings FOR SELECT USING (true);
CREATE POLICY "football_standings_insert" ON public.football_league_standings FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.football_teams WHERE id = team_id)
);
CREATE POLICY "football_standings_update" ON public.football_league_standings FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.football_teams WHERE id = team_id)
);

-- Football transfers
CREATE TABLE public.football_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID DEFAULT NULL,
  player_id UUID REFERENCES public.football_players(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'listed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);
ALTER TABLE public.football_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_transfers_select" ON public.football_transfers FOR SELECT USING (true);
CREATE POLICY "football_transfers_insert" ON public.football_transfers FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "football_transfers_update" ON public.football_transfers FOR UPDATE USING (auth.uid() IN (seller_id, buyer_id));

-- Football stadiums
CREATE TABLE public.football_stadiums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Stadium',
  capacity INTEGER NOT NULL DEFAULT 5000,
  upgrade_level INTEGER NOT NULL DEFAULT 1,
  upgrade_cost INTEGER NOT NULL DEFAULT 2000,
  income_per_match INTEGER NOT NULL DEFAULT 100,
  theme TEXT DEFAULT 'classic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.football_stadiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "football_stadiums_select" ON public.football_stadiums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "football_stadiums_insert" ON public.football_stadiums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "football_stadiums_update" ON public.football_stadiums FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_football_players_user ON public.football_players(user_id);
CREATE INDEX idx_football_players_team ON public.football_players(team_id);
CREATE INDEX idx_football_players_sale ON public.football_players(is_for_sale) WHERE is_for_sale = true;
CREATE INDEX idx_football_matches_teams ON public.football_matches(home_team_id, away_team_id);
CREATE INDEX idx_football_transfers_status ON public.football_transfers(status) WHERE status = 'listed';
CREATE INDEX idx_football_league_standings ON public.football_league_standings(league_id, points DESC);
