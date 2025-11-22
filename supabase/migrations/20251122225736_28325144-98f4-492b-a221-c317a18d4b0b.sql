-- Create post_edit_history table
CREATE TABLE IF NOT EXISTS post_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_by UUID NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_edit_history
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_edit_history' 
    AND policyname = 'Users can view edit history of their posts'
  ) THEN
    CREATE POLICY "Users can view edit history of their posts" ON post_edit_history 
      FOR SELECT USING (
        edited_by = auth.uid() OR 
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_edit_history.post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_edit_history' 
    AND policyname = 'Users can insert edit history for their posts'
  ) THEN
    CREATE POLICY "Users can insert edit history for their posts" ON post_edit_history 
      FOR INSERT WITH CHECK (auth.uid() = edited_by);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_post_edit_history_post_id ON post_edit_history(post_id);

-- Create post_reports table
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

-- Enable RLS
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reports
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reports' 
    AND policyname = 'Users can view their own reports'
  ) THEN
    CREATE POLICY "Users can view their own reports" ON post_reports FOR SELECT USING (auth.uid() = reported_by);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reports' 
    AND policyname = 'Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports" ON post_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);

-- Create user_follows table (if not exists)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_follows' 
    AND policyname = 'Anyone can view follows'
  ) THEN
    CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_follows' 
    AND policyname = 'Users can follow others'
  ) THEN
    CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_follows' 
    AND policyname = 'Users can unfollow'
  ) THEN
    CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (auth.uid() = follower_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);