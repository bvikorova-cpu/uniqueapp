-- Create post_translations table
CREATE TABLE IF NOT EXISTS post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translated_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, language)
);

-- Enable RLS
ALTER TABLE post_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_translations' AND policyname = 'Anyone can view translations'
  ) THEN
    CREATE POLICY "Anyone can view translations" ON post_translations FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_translations' AND policyname = 'System can manage translations'
  ) THEN
    CREATE POLICY "System can manage translations" ON post_translations 
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_language ON post_translations(language);

-- Create voice_posts table
CREATE TABLE IF NOT EXISTS voice_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  transcript TEXT,
  waveform_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE voice_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_posts' AND policyname = 'Anyone can view voice posts'
  ) THEN
    CREATE POLICY "Anyone can view voice posts" ON voice_posts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_posts' AND policyname = 'Post owners can manage voice posts'
  ) THEN
    CREATE POLICY "Post owners can manage voice posts" ON voice_posts 
      FOR ALL USING (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = voice_posts.post_id AND posts.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = voice_posts.post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_voice_posts_post_id ON voice_posts(post_id);

-- Create post_reminders table
CREATE TABLE IF NOT EXISTS post_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT DEFAULT 'view' CHECK (reminder_type IN ('view', 'reply', 'share')),
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reminders' AND policyname = 'Users can view their reminders'
  ) THEN
    CREATE POLICY "Users can view their reminders" ON post_reminders 
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_reminders' AND policyname = 'Users can manage their reminders'
  ) THEN
    CREATE POLICY "Users can manage their reminders" ON post_reminders 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reminders_user_id ON post_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reminders_remind_at ON post_reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_post_reminders_is_sent ON post_reminders(is_sent);

-- Create post_embeds table
CREATE TABLE IF NOT EXISTS post_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  embed_type TEXT NOT NULL CHECK (embed_type IN ('link', 'video', 'music', 'location', 'product')),
  embed_url TEXT NOT NULL,
  embed_title TEXT,
  embed_description TEXT,
  embed_image TEXT,
  embed_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_embeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_embeds' AND policyname = 'Anyone can view embeds'
  ) THEN
    CREATE POLICY "Anyone can view embeds" ON post_embeds FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_embeds' AND policyname = 'Post owners can manage embeds'
  ) THEN
    CREATE POLICY "Post owners can manage embeds" ON post_embeds 
      FOR ALL USING (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_embeds.post_id AND posts.user_id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM posts WHERE posts.id = post_embeds.post_id AND posts.user_id = auth.uid())
      );
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_post_embeds_post_id ON post_embeds(post_id);
CREATE INDEX IF NOT EXISTS idx_post_embeds_type ON post_embeds(embed_type);

-- Create trending_posts table
CREATE TABLE IF NOT EXISTS trending_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  trending_score FLOAT DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  views_24h INTEGER DEFAULT 0,
  reactions_24h INTEGER DEFAULT 0,
  comments_24h INTEGER DEFAULT 0,
  shares_24h INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE trending_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trending_posts' AND policyname = 'Anyone can view trending posts'
  ) THEN
    CREATE POLICY "Anyone can view trending posts" ON trending_posts FOR SELECT USING (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trending_posts_score ON trending_posts(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_posts_updated ON trending_posts(updated_at DESC);