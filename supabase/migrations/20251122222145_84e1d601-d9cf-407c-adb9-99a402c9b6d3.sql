-- Create verified_users table
CREATE TABLE IF NOT EXISTS public.verified_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  badge_type TEXT NOT NULL DEFAULT 'verified',
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trending_topics table
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL UNIQUE,
  post_count INTEGER NOT NULL DEFAULT 0,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  result_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create direct_messages table (instead of conversations/messages)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verified_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verified_users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'verified_users' AND policyname = 'Anyone can view verified users') THEN
    CREATE POLICY "Anyone can view verified users" ON public.verified_users FOR SELECT USING (true);
  END IF;
END $$;

-- RLS Policies for trending_topics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trending_topics' AND policyname = 'Anyone can view trending topics') THEN
    CREATE POLICY "Anyone can view trending topics" ON public.trending_topics FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trending_topics' AND policyname = 'System can manage trending topics') THEN
    CREATE POLICY "System can manage trending topics" ON public.trending_topics FOR ALL USING (true);
  END IF;
END $$;

-- RLS Policies for search_history
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can view their search history') THEN
    CREATE POLICY "Users can view their search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can create search history') THEN
    CREATE POLICY "Users can create search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for direct_messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'direct_messages' AND policyname = 'Users can view their messages') THEN
    CREATE POLICY "Users can view their messages" ON public.direct_messages FOR SELECT USING (
      auth.uid() = sender_id OR auth.uid() = receiver_id
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'direct_messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'direct_messages' AND policyname = 'Users can update their received messages') THEN
    CREATE POLICY "Users can update their received messages" ON public.direct_messages FOR UPDATE USING (auth.uid() = receiver_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verified_users_user_id ON public.verified_users(user_id);
CREATE INDEX IF NOT EXISTS idx_trending_topics_engagement ON public.trending_topics(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);