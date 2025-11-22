-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_hashtags table
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Create post_mentions table
CREATE TABLE IF NOT EXISTS public.post_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, mentioned_user_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create post_shares table
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  shared_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  share_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (true);

-- RLS Policies for poll_options
CREATE POLICY "Anyone can view poll options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Users can create poll options" ON public.poll_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update poll options" ON public.poll_options FOR UPDATE USING (true);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view their own votes" ON public.poll_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create votes" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their votes" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for hashtags
CREATE POLICY "Anyone can view hashtags" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "Users can create hashtags" ON public.hashtags FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update hashtags" ON public.hashtags FOR UPDATE USING (true);

-- RLS Policies for post_hashtags
CREATE POLICY "Anyone can view post hashtags" ON public.post_hashtags FOR SELECT USING (true);
CREATE POLICY "Users can create post hashtags" ON public.post_hashtags FOR INSERT WITH CHECK (true);

-- RLS Policies for post_mentions
CREATE POLICY "Anyone can view mentions" ON public.post_mentions FOR SELECT USING (true);
CREATE POLICY "Users can create mentions" ON public.post_mentions FOR INSERT WITH CHECK (true);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_shares
CREATE POLICY "Anyone can view shares" ON public.post_shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares" ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their shares" ON public.post_shares FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON public.poll_votes(user_id);
CREATE INDEX idx_hashtags_tag ON public.hashtags(tag);
CREATE INDEX idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);
CREATE INDEX idx_post_mentions_post_id ON public.post_mentions(post_id);
CREATE INDEX idx_post_mentions_user_id ON public.post_mentions(mentioned_user_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX idx_post_shares_original_post_id ON public.post_shares(original_post_id);

-- Trigger to update hashtag use_count
CREATE OR REPLACE FUNCTION public.update_hashtag_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.hashtags SET use_count = use_count + 1 WHERE id = NEW.hashtag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.hashtags SET use_count = use_count - 1 WHERE id = OLD.hashtag_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_hashtag_count_trigger
AFTER INSERT OR DELETE ON public.post_hashtags
FOR EACH ROW
EXECUTE FUNCTION public.update_hashtag_count();