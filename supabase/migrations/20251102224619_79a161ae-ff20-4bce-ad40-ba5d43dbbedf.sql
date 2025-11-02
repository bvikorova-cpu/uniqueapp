-- Create escape rooms table
CREATE TABLE IF NOT EXISTS public.escape_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  theme TEXT NOT NULL CHECK (theme IN ('horror', 'mystery', 'sci-fi', 'adventure', 'fantasy', 'educational', 'corporate')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_players INTEGER NOT NULL DEFAULT 6,
  is_premium BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  room_type TEXT NOT NULL CHECK (room_type IN ('multiplayer', 'timed_challenge', 'educational', 'corporate')),
  thumbnail_url TEXT,
  total_plays INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escape room puzzles table
CREATE TABLE IF NOT EXISTS public.escape_room_puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  puzzle_order INTEGER NOT NULL,
  puzzle_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  puzzle_data JSONB NOT NULL,
  solution JSONB NOT NULL,
  hint_text TEXT,
  hint_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escape room sessions table
CREATE TABLE IF NOT EXISTS public.escape_room_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed', 'failed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_time_seconds INTEGER,
  score INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session players table
CREATE TABLE IF NOT EXISTS public.session_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.escape_room_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('host', 'player')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, user_id)
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.escape_room_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.escape_room_sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  completion_time_seconds INTEGER NOT NULL,
  score INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create escape room subscriptions table
CREATE TABLE IF NOT EXISTS public.escape_room_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'corporate', 'educational')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create earnings table
CREATE TABLE IF NOT EXISTS public.escape_room_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.escape_room_sessions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timed challenges table
CREATE TABLE IF NOT EXISTS public.escape_room_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  access_price DECIMAL(10,2) NOT NULL,
  access_duration_hours INTEGER NOT NULL,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge access table
CREATE TABLE IF NOT EXISTS public.challenge_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.escape_room_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.escape_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escape_room_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escape_rooms
CREATE POLICY "Anyone can view published rooms" ON public.escape_rooms
  FOR SELECT USING (is_published = true);

CREATE POLICY "Creators can view their own rooms" ON public.escape_rooms
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated users can create rooms" ON public.escape_rooms
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own rooms" ON public.escape_rooms
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own rooms" ON public.escape_rooms
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for puzzles
CREATE POLICY "Anyone can view puzzles for published rooms" ON public.escape_room_puzzles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.escape_rooms
      WHERE escape_rooms.id = escape_room_puzzles.room_id
      AND escape_rooms.is_published = true
    )
  );

CREATE POLICY "Creators can manage puzzles" ON public.escape_room_puzzles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.escape_rooms
      WHERE escape_rooms.id = escape_room_puzzles.room_id
      AND escape_rooms.creator_id = auth.uid()
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Anyone can view sessions" ON public.escape_room_sessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create sessions" ON public.escape_room_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Session players can update sessions" ON public.escape_room_sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.session_players
      WHERE session_players.session_id = escape_room_sessions.id
      AND session_players.user_id = auth.uid()
    )
  );

-- RLS Policies for session players
CREATE POLICY "Anyone can view session players" ON public.session_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join sessions" ON public.session_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave sessions" ON public.session_players
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leaderboard
CREATE POLICY "Anyone can view leaderboard" ON public.escape_room_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "System can insert leaderboard entries" ON public.escape_room_leaderboard
  FOR INSERT WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON public.escape_room_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their subscription" ON public.escape_room_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for earnings
CREATE POLICY "Creators can view their earnings" ON public.escape_room_earnings
  FOR SELECT USING (auth.uid() = creator_id);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges" ON public.escape_room_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Premium users can create challenges" ON public.escape_room_challenges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.escape_room_subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND tier IN ('premium', 'corporate')
    )
  );

-- RLS Policies for challenge access
CREATE POLICY "Users can view their challenge access" ON public.challenge_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase challenge access" ON public.challenge_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_escape_rooms_creator ON public.escape_rooms(creator_id);
CREATE INDEX idx_escape_rooms_theme ON public.escape_rooms(theme);
CREATE INDEX idx_escape_rooms_published ON public.escape_rooms(is_published);
CREATE INDEX idx_puzzles_room ON public.escape_room_puzzles(room_id);
CREATE INDEX idx_sessions_room ON public.escape_room_sessions(room_id);
CREATE INDEX idx_session_players_session ON public.session_players(session_id);
CREATE INDEX idx_session_players_user ON public.session_players(user_id);
CREATE INDEX idx_leaderboard_room ON public.escape_room_leaderboard(room_id);
CREATE INDEX idx_earnings_creator ON public.escape_room_earnings(creator_id);

-- Create function to update room plays
CREATE OR REPLACE FUNCTION update_room_plays()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'in_progress' AND OLD.status = 'waiting' THEN
    UPDATE public.escape_rooms
    SET total_plays = total_plays + 1
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for room plays
CREATE TRIGGER update_room_plays_trigger
  AFTER UPDATE ON public.escape_room_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_room_plays();

-- Create function to add leaderboard entry
CREATE OR REPLACE FUNCTION add_leaderboard_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.completion_time_seconds IS NOT NULL THEN
    INSERT INTO public.escape_room_leaderboard (
      room_id,
      session_id,
      team_name,
      completion_time_seconds,
      score,
      hints_used
    ) VALUES (
      NEW.room_id,
      NEW.id,
      NEW.team_name,
      NEW.completion_time_seconds,
      NEW.score,
      NEW.hints_used
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for leaderboard
CREATE TRIGGER add_leaderboard_entry_trigger
  AFTER UPDATE ON public.escape_room_sessions
  FOR EACH ROW
  EXECUTE FUNCTION add_leaderboard_entry();