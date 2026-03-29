-- Forum Polls
CREATE TABLE IF NOT EXISTS forum_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view polls" ON forum_polls FOR SELECT USING (true);
CREATE POLICY "Auth users can create polls" ON forum_polls FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Forum Poll Votes
CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES forum_polls(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  option_index int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE forum_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view poll votes" ON forum_poll_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON forum_poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Forum Reputation
CREATE TABLE IF NOT EXISTS forum_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  points int DEFAULT 0,
  level int DEFAULT 1,
  badges jsonb DEFAULT '[]',
  posts_count int DEFAULT 0,
  helpful_count int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_reputation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reputation" ON forum_reputation FOR SELECT USING (true);
CREATE POLICY "Auth users insert own reputation" ON forum_reputation FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users update own reputation" ON forum_reputation FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Live Debate Rooms
CREATE TABLE IF NOT EXISTS forum_debate_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  topic text NOT NULL,
  description text,
  side_a text NOT NULL DEFAULT 'For',
  side_b text NOT NULL DEFAULT 'Against',
  status text DEFAULT 'active',
  duration_minutes int DEFAULT 30,
  votes_a int DEFAULT 0,
  votes_b int DEFAULT 0,
  participants_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz
);

ALTER TABLE forum_debate_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view debates" ON forum_debate_rooms FOR SELECT USING (true);
CREATE POLICY "Auth users create debates" ON forum_debate_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Auth users update own debates" ON forum_debate_rooms FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

-- Debate Messages
CREATE TABLE IF NOT EXISTS forum_debate_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES forum_debate_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  side text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_debate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view debate messages" ON forum_debate_messages FOR SELECT USING (true);
CREATE POLICY "Auth users post debate messages" ON forum_debate_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Debate Votes
CREATE TABLE IF NOT EXISTS forum_debate_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES forum_debate_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  side text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE forum_debate_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view debate votes" ON forum_debate_votes FOR SELECT USING (true);
CREATE POLICY "Auth users vote in debates" ON forum_debate_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);