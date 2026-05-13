-- Close Friends list
CREATE TABLE IF NOT EXISTS public.user_close_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);
ALTER TABLE public.user_close_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages close friends" ON public.user_close_friends
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_close_friends_user ON public.user_close_friends(user_id);

-- Temporary mutes
CREATE TABLE IF NOT EXISTS public.user_mutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  muted_user_id UUID NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_user_id)
);
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages mutes" ON public.user_mutes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_user ON public.user_mutes(user_id);

-- Saved searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages saved searches" ON public.saved_searches
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Followed topics/hashtags
CREATE TABLE IF NOT EXISTS public.followed_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic)
);
ALTER TABLE public.followed_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages followed topics" ON public.followed_topics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add audience column to posts (close_friends, public, friends, private)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'public';

-- Add share_token to saved_collections (bookmarks folders shareable link)
ALTER TABLE public.saved_collections ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
ALTER TABLE public.saved_collections ADD COLUMN IF NOT EXISTS notes TEXT;
