-- Create user_activity table for online/offline status
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline', 'busy')),
  last_seen TIMESTAMPTZ DEFAULT now(),
  custom_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_activity' AND policyname = 'Anyone can view activity'
  ) THEN
    CREATE POLICY "Anyone can view activity" ON user_activity FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_activity' AND policyname = 'Users can update their own activity'
  ) THEN
    CREATE POLICY "Users can update their own activity" ON user_activity 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_status ON user_activity(status);

-- Create post_templates table
CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_templates' AND policyname = 'Users can view their own templates'
  ) THEN
    CREATE POLICY "Users can view their own templates" ON post_templates 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_templates' AND policyname = 'Users can manage their own templates'
  ) THEN
    CREATE POLICY "Users can manage their own templates" ON post_templates 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_post_templates_user_id ON post_templates(user_id);

-- Create post_moods table
CREATE TABLE IF NOT EXISTS post_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_moods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_moods' AND policyname = 'Anyone can view post moods'
  ) THEN
    CREATE POLICY "Anyone can view post moods" ON post_moods FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_moods' AND policyname = 'Users can add mood to their posts'
  ) THEN
    CREATE POLICY "Users can add mood to their posts" ON post_moods 
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_moods.post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_post_moods_post_id ON post_moods(post_id);

-- Create user_stories table
CREATE TABLE IF NOT EXISTS user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable RLS
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stories' AND policyname = 'Anyone can view active stories'
  ) THEN
    CREATE POLICY "Anyone can view active stories" ON user_stories 
      FOR SELECT USING (expires_at > now());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stories' AND policyname = 'Users can create their own stories'
  ) THEN
    CREATE POLICY "Users can create their own stories" ON user_stories 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_stories' AND policyname = 'Users can delete their own stories'
  ) THEN
    CREATE POLICY "Users can delete their own stories" ON user_stories 
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_expires_at ON user_stories(expires_at);

-- Create story_views table
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Enable RLS
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'story_views' AND policyname = 'Story owners can view who viewed'
  ) THEN
    CREATE POLICY "Story owners can view who viewed" ON story_views 
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_stories WHERE user_stories.id = story_views.story_id AND user_stories.user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'story_views' AND policyname = 'Users can record their views'
  ) THEN
    CREATE POLICY "Users can record their views" ON story_views 
      FOR INSERT WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);

-- Create post_threads table
CREATE TABLE IF NOT EXISTS post_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  child_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  thread_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_post_id, child_post_id)
);

-- Enable RLS
ALTER TABLE post_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_threads' AND policyname = 'Anyone can view threads'
  ) THEN
    CREATE POLICY "Anyone can view threads" ON post_threads FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_threads' AND policyname = 'Users can create threads for their posts'
  ) THEN
    CREATE POLICY "Users can create threads for their posts" ON post_threads 
      FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_threads.parent_post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_threads_parent ON post_threads(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_post_threads_child ON post_threads(child_post_id);