-- Anonymous Dating Credits Table
CREATE TABLE IF NOT EXISTS anonymous_dating_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER DEFAULT 0,
  total_credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous Dating Matches Table
CREATE TABLE IF NOT EXISTS anonymous_dating_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revealed', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  revealed_at TIMESTAMPTZ,
  user1_revealed BOOLEAN DEFAULT FALSE,
  user2_revealed BOOLEAN DEFAULT FALSE,
  match_interests JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous Dating Messages Table
CREATE TABLE IF NOT EXISTS anonymous_dating_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES anonymous_dating_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'hint', 'gift')),
  content TEXT NOT NULL,
  voice_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous Dating Profiles Table (masked identity)
CREATE TABLE IF NOT EXISTS anonymous_dating_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  anonymous_name TEXT NOT NULL,
  age_range TEXT,
  interests TEXT[],
  looking_for TEXT,
  personality_traits TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE anonymous_dating_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_dating_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_dating_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Credits
CREATE POLICY "Users can view own credits"
  ON anonymous_dating_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON anonymous_dating_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON anonymous_dating_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Matches
CREATE POLICY "Users can view own matches"
  ON anonymous_dating_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own matches"
  ON anonymous_dating_matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can insert matches"
  ON anonymous_dating_matches FOR INSERT
  WITH CHECK (true);

-- RLS Policies for Messages
CREATE POLICY "Users can view match messages"
  ON anonymous_dating_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM anonymous_dating_matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON anonymous_dating_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM anonymous_dating_matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'active'
    )
  );

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile"
  ON anonymous_dating_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON anonymous_dating_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON anonymous_dating_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_anonymous_dating_credits_user ON anonymous_dating_credits(user_id);
CREATE INDEX idx_anonymous_dating_matches_users ON anonymous_dating_matches(user1_id, user2_id);
CREATE INDEX idx_anonymous_dating_matches_status ON anonymous_dating_matches(status);
CREATE INDEX idx_anonymous_dating_messages_match ON anonymous_dating_messages(match_id);
CREATE INDEX idx_anonymous_dating_profiles_user ON anonymous_dating_profiles(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_anonymous_dating_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anonymous_dating_credits_updated_at
  BEFORE UPDATE ON anonymous_dating_credits
  FOR EACH ROW EXECUTE FUNCTION update_anonymous_dating_updated_at();

CREATE TRIGGER update_anonymous_dating_matches_updated_at
  BEFORE UPDATE ON anonymous_dating_matches
  FOR EACH ROW EXECUTE FUNCTION update_anonymous_dating_updated_at();

CREATE TRIGGER update_anonymous_dating_profiles_updated_at
  BEFORE UPDATE ON anonymous_dating_profiles
  FOR EACH ROW EXECUTE FUNCTION update_anonymous_dating_updated_at();