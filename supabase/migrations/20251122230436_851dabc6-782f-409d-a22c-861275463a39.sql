-- Create post_gifts table
CREATE TABLE IF NOT EXISTS post_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  gift_value INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_gifts' AND policyname = 'Anyone can view gifts'
  ) THEN
    CREATE POLICY "Anyone can view gifts" ON post_gifts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_gifts' AND policyname = 'Users can send gifts'
  ) THEN
    CREATE POLICY "Users can send gifts" ON post_gifts 
      FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_gifts_post_id ON post_gifts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_gifts_sender_id ON post_gifts(sender_id);

-- Create user_recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommended_user_id UUID NOT NULL,
  reason TEXT,
  score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, recommended_user_id)
);

-- Enable RLS
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_recommendations' AND policyname = 'Users can view their recommendations'
  ) THEN
    CREATE POLICY "Users can view their recommendations" ON user_recommendations 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_score ON user_recommendations(score DESC);

-- Create archived_posts table
CREATE TABLE IF NOT EXISTS archived_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE archived_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'archived_posts' AND policyname = 'Users can view their archived posts'
  ) THEN
    CREATE POLICY "Users can view their archived posts" ON archived_posts 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'archived_posts' AND policyname = 'Users can manage their archives'
  ) THEN
    CREATE POLICY "Users can manage their archives" ON archived_posts 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_archived_posts_user_id ON archived_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_posts_post_id ON archived_posts(post_id);

-- Create live_posts table
CREATE TABLE IF NOT EXISTS live_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  viewers_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE live_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'live_posts' AND policyname = 'Anyone can view live posts'
  ) THEN
    CREATE POLICY "Anyone can view live posts" ON live_posts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'live_posts' AND policyname = 'Post owners can manage live posts'
  ) THEN
    CREATE POLICY "Post owners can manage live posts" ON live_posts 
      FOR ALL USING (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = live_posts.post_id AND posts.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = live_posts.post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_live_posts_post_id ON live_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_live_posts_is_active ON live_posts(is_active);

-- Create live_viewers table
CREATE TABLE IF NOT EXISTS live_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  live_post_id UUID NOT NULL REFERENCES live_posts(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  UNIQUE(live_post_id, viewer_id)
);

-- Enable RLS
ALTER TABLE live_viewers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'live_viewers' AND policyname = 'Anyone can view viewers'
  ) THEN
    CREATE POLICY "Anyone can view viewers" ON live_viewers FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'live_viewers' AND policyname = 'Users can record their viewing'
  ) THEN
    CREATE POLICY "Users can record their viewing" ON live_viewers 
      FOR ALL USING (auth.uid() = viewer_id) WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_live_viewers_live_post_id ON live_viewers(live_post_id);