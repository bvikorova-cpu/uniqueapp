-- Create post_edits table for tracking post edit history
CREATE TABLE IF NOT EXISTS public.post_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  previous_content TEXT NOT NULL,
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_media_gallery table
CREATE TABLE IF NOT EXISTS public.user_media_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  album_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy_settings table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  profile_visibility TEXT NOT NULL DEFAULT 'public',
  post_visibility TEXT NOT NULL DEFAULT 'public',
  who_can_message TEXT NOT NULL DEFAULT 'everyone',
  who_can_comment TEXT NOT NULL DEFAULT 'everyone',
  who_can_tag TEXT NOT NULL DEFAULT 'everyone',
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  show_activity BOOLEAN NOT NULL DEFAULT true,
  show_birthday BOOLEAN NOT NULL DEFAULT true,
  show_friends_list BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  target_id UUID,
  target_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blocked_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

-- Enable RLS
ALTER TABLE public.post_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_edits
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_edits' AND policyname = 'Anyone can view post edits') THEN
    CREATE POLICY "Anyone can view post edits" ON public.post_edits FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_edits' AND policyname = 'Users can create post edit history') THEN
    CREATE POLICY "Users can create post edit history" ON public.post_edits FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for user_media_gallery
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_media_gallery' AND policyname = 'Users can view their own media') THEN
    CREATE POLICY "Users can view their own media" ON public.user_media_gallery FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_media_gallery' AND policyname = 'Users can view public media') THEN
    CREATE POLICY "Users can view public media" ON public.user_media_gallery FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_media_gallery' AND policyname = 'Users can create media') THEN
    CREATE POLICY "Users can create media" ON public.user_media_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_media_gallery' AND policyname = 'Users can update their media') THEN
    CREATE POLICY "Users can update their media" ON public.user_media_gallery FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_media_gallery' AND policyname = 'Users can delete their media') THEN
    CREATE POLICY "Users can delete their media" ON public.user_media_gallery FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for privacy_settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privacy_settings' AND policyname = 'Users can view their own settings') THEN
    CREATE POLICY "Users can view their own settings" ON public.privacy_settings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privacy_settings' AND policyname = 'Users can insert their settings') THEN
    CREATE POLICY "Users can insert their settings" ON public.privacy_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privacy_settings' AND policyname = 'Users can update their settings') THEN
    CREATE POLICY "Users can update their settings" ON public.privacy_settings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for activity_feed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_feed' AND policyname = 'Users can view their activity') THEN
    CREATE POLICY "Users can view their activity" ON public.activity_feed FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_feed' AND policyname = 'System can create activity') THEN
    CREATE POLICY "System can create activity" ON public.activity_feed FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for blocked_users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_users' AND policyname = 'Users can view their blocked list') THEN
    CREATE POLICY "Users can view their blocked list" ON public.blocked_users FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_users' AND policyname = 'Users can block users') THEN
    CREATE POLICY "Users can block users" ON public.blocked_users FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blocked_users' AND policyname = 'Users can unblock users') THEN
    CREATE POLICY "Users can unblock users" ON public.blocked_users FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_edits_post_id ON public.post_edits(post_id);
CREATE INDEX IF NOT EXISTS idx_user_media_gallery_user_id ON public.user_media_gallery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_media_gallery_album ON public.user_media_gallery(album_name);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON public.blocked_users(blocked_user_id);

-- Add edited_at column to posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'edited_at') THEN
    ALTER TABLE public.posts ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;