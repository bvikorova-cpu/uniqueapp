-- Brain Duel Enhanced System Tables

-- Add game_mode column to matches if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'game_mode') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN game_mode text DEFAULT 'quick';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'total_questions') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN total_questions integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'time_per_question') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN time_per_question integer DEFAULT 30;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'entry_cost') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN entry_cost integer DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'win_reward') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN win_reward integer DEFAULT 20;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'league') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN league text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'brain_duel_matches' 
                 AND column_name = 'is_spectatable') THEN
    ALTER TABLE brain_duel_matches ADD COLUMN is_spectatable boolean DEFAULT true;
  END IF;
END $$;

-- Create brain_duel_leagues table for league rankings
CREATE TABLE IF NOT EXISTS brain_duel_leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  league text NOT NULL DEFAULT 'bronze',
  total_wins integer DEFAULT 0,
  total_losses integer DEFAULT 0,
  win_streak integer DEFAULT 0,
  best_win_streak integer DEFAULT 0,
  league_points integer DEFAULT 0,
  season text DEFAULT 'Q1-2026',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, season)
);

-- Enable RLS
ALTER TABLE brain_duel_leagues ENABLE ROW LEVEL SECURITY;

-- RLS policies for leagues
CREATE POLICY "Users can view all league standings" ON brain_duel_leagues
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own league data" ON brain_duel_leagues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own league data" ON brain_duel_leagues
  FOR UPDATE USING (auth.uid() = user_id);

-- Create brain_duel_spectators table
CREATE TABLE IF NOT EXISTS brain_duel_spectators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES brain_duel_matches ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  UNIQUE(match_id, user_id)
);

-- Enable RLS
ALTER TABLE brain_duel_spectators ENABLE ROW LEVEL SECURITY;

-- RLS policies for spectators
CREATE POLICY "Anyone can view spectators" ON brain_duel_spectators
  FOR SELECT USING (true);

CREATE POLICY "Users can join as spectator" ON brain_duel_spectators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their spectator status" ON brain_duel_spectators
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave as spectator" ON brain_duel_spectators
  FOR DELETE USING (auth.uid() = user_id);

-- Create brain_duel_gifts table for virtual gifts
CREATE TABLE IF NOT EXISTS brain_duel_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES brain_duel_matches ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users NOT NULL,
  recipient_id uuid REFERENCES auth.users NOT NULL,
  gift_type text NOT NULL,
  gift_cost integer NOT NULL,
  message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE brain_duel_gifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for gifts
CREATE POLICY "Anyone can view gifts" ON brain_duel_gifts
  FOR SELECT USING (true);

CREATE POLICY "Users can send gifts" ON brain_duel_gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create brain_duel_question_packs table
CREATE TABLE IF NOT EXISTS brain_duel_question_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  question_count integer NOT NULL DEFAULT 0,
  price_credits integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE brain_duel_question_packs ENABLE ROW LEVEL SECURITY;

-- RLS policies for question packs
CREATE POLICY "Anyone can view question packs" ON brain_duel_question_packs
  FOR SELECT USING (true);

-- Create brain_duel_user_packs for purchased packs
CREATE TABLE IF NOT EXISTS brain_duel_user_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  pack_id uuid REFERENCES brain_duel_question_packs NOT NULL,
  purchased_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, pack_id)
);

-- Enable RLS
ALTER TABLE brain_duel_user_packs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user packs
CREATE POLICY "Users can view their own packs" ON brain_duel_user_packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase packs" ON brain_duel_user_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create brain_duel_match_chat table for spectator chat
CREATE TABLE IF NOT EXISTS brain_duel_match_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES brain_duel_matches ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'chat',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE brain_duel_match_chat ENABLE ROW LEVEL SECURITY;

-- RLS policies for match chat
CREATE POLICY "Anyone can view match chat" ON brain_duel_match_chat
  FOR SELECT USING (true);

CREATE POLICY "Users can send chat messages" ON brain_duel_match_chat
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE brain_duel_spectators;
ALTER PUBLICATION supabase_realtime ADD TABLE brain_duel_gifts;
ALTER PUBLICATION supabase_realtime ADD TABLE brain_duel_match_chat;

-- Insert default question packs
INSERT INTO brain_duel_question_packs (name, description, category, question_count, price_credits, icon) VALUES
('Celebrity Pack', 'Test your knowledge of famous personalities', 'Entertainment', 100, 30, '⭐'),
('History Bundle', 'Journey through time with historical questions', 'History', 200, 50, '📜'),
('Science Mega Pack', 'Explore the wonders of science', 'Science', 300, 80, '🔬'),
('Geography Explorer', 'Travel the world with geography questions', 'Geography', 150, 40, '🌍'),
('Sports Champions', 'Questions about sports legends and events', 'Sports', 120, 35, '⚽'),
('Music Masters', 'From classical to pop - test your music knowledge', 'Music', 100, 30, '🎵'),
('Tech Wizards', 'Stay updated with technology questions', 'Technology', 150, 45, '💻'),
('Art & Culture', 'Explore the world of art and culture', 'Art', 100, 30, '🎨')
ON CONFLICT DO NOTHING;