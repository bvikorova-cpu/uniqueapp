-- Create parallel_lives table
CREATE TABLE IF NOT EXISTS public.parallel_lives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_name TEXT NOT NULL,
  persona TEXT NOT NULL,
  bio TEXT,
  profession TEXT,
  lifestyle TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  follower_count INTEGER NOT NULL DEFAULT 0,
  post_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parallel_posts table
CREATE TABLE IF NOT EXISTS public.parallel_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  life_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parallel_followers table
CREATE TABLE IF NOT EXISTS public.parallel_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  life_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(life_id, follower_id)
);

-- Create parallel_subscriptions table
CREATE TABLE IF NOT EXISTS public.parallel_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'unlimited')),
  max_lives INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cross_reality_reveals table
CREATE TABLE IF NOT EXISTS public.cross_reality_reveals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  revealer_life_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  target_life_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 4.99,
  revealed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message TEXT
);

-- Create reality_merges table
CREATE TABLE IF NOT EXISTS public.reality_merges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_1_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  life_2_id UUID NOT NULL REFERENCES public.parallel_lives(id) ON DELETE CASCADE,
  merged_life_id UUID REFERENCES public.parallel_lives(id) ON DELETE SET NULL,
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  merged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  merge_data JSONB NOT NULL DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.parallel_lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parallel_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parallel_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parallel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_reality_reveals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_merges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parallel_lives
CREATE POLICY "Anyone can view active lives"
  ON public.parallel_lives FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own lives"
  ON public.parallel_lives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lives"
  ON public.parallel_lives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lives"
  ON public.parallel_lives FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for parallel_posts
CREATE POLICY "Anyone can view posts from active lives"
  ON public.parallel_posts FOR SELECT
  USING (
    life_id IN (SELECT id FROM public.parallel_lives WHERE is_active = true)
  );

CREATE POLICY "Life owners can create posts"
  ON public.parallel_posts FOR INSERT
  WITH CHECK (
    life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
  );

CREATE POLICY "Life owners can update their posts"
  ON public.parallel_posts FOR UPDATE
  USING (
    life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
  );

CREATE POLICY "Life owners can delete their posts"
  ON public.parallel_posts FOR DELETE
  USING (
    life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
  );

-- RLS Policies for parallel_followers
CREATE POLICY "Anyone can view followers"
  ON public.parallel_followers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow lives"
  ON public.parallel_followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow lives"
  ON public.parallel_followers FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS Policies for parallel_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.parallel_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.parallel_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.parallel_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for cross_reality_reveals
CREATE POLICY "Revealed users can view reveals"
  ON public.cross_reality_reveals FOR SELECT
  USING (
    revealer_life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
    OR target_life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
  );

CREATE POLICY "Life owners can create reveals"
  ON public.cross_reality_reveals FOR INSERT
  WITH CHECK (
    revealer_life_id IN (SELECT id FROM public.parallel_lives WHERE user_id = auth.uid())
  );

-- RLS Policies for reality_merges
CREATE POLICY "Users can view their own merges"
  ON public.reality_merges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create merges"
  ON public.reality_merges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_parallel_lives_user_id ON public.parallel_lives(user_id);
CREATE INDEX idx_parallel_lives_active ON public.parallel_lives(is_active);
CREATE INDEX idx_parallel_posts_life_id ON public.parallel_posts(life_id);
CREATE INDEX idx_parallel_followers_life_id ON public.parallel_followers(life_id);
CREATE INDEX idx_parallel_followers_follower_id ON public.parallel_followers(follower_id);
CREATE INDEX idx_parallel_subscriptions_user_id ON public.parallel_subscriptions(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_parallel_lives_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_parallel_lives_timestamp
  BEFORE UPDATE ON public.parallel_lives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_parallel_lives_updated_at();

-- Create function to update follower count
CREATE OR REPLACE FUNCTION public.update_parallel_life_followers()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.parallel_lives
    SET follower_count = follower_count + 1
    WHERE id = NEW.life_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.parallel_lives
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.life_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for follower count updates
CREATE TRIGGER update_follower_count_trigger
  AFTER INSERT OR DELETE ON public.parallel_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_parallel_life_followers();