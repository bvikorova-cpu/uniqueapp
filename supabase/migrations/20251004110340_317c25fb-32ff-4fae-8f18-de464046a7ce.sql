-- Create influencer profiles table
CREATE TABLE public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  category TEXT NOT NULL,
  social_links JSONB DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;

-- Create influencer posts table
CREATE TABLE public.influencer_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.influencer_posts ENABLE ROW LEVEL SECURITY;

-- Create influencer followers table
CREATE TABLE public.influencer_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (influencer_id, follower_id)
);

ALTER TABLE public.influencer_followers ENABLE ROW LEVEL SECURITY;

-- Create post likes table
CREATE TABLE public.influencer_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.influencer_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.influencer_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for influencer_profiles
CREATE POLICY "Anyone can view active influencer profiles"
  ON public.influencer_profiles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create their profile"
  ON public.influencer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.influencer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.influencer_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for influencer_posts
CREATE POLICY "Anyone can view active posts"
  ON public.influencer_posts
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Influencers can create their own posts"
  ON public.influencer_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE influencer_profiles.id = influencer_posts.influencer_id
        AND influencer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can update their own posts"
  ON public.influencer_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE influencer_profiles.id = influencer_posts.influencer_id
        AND influencer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can delete their own posts"
  ON public.influencer_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE influencer_profiles.id = influencer_posts.influencer_id
        AND influencer_profiles.user_id = auth.uid()
    )
  );

-- RLS Policies for influencer_followers
CREATE POLICY "Anyone can view followers"
  ON public.influencer_followers
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow influencers"
  ON public.influencer_followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.influencer_followers
  FOR DELETE
  USING (auth.uid() = follower_id);

-- RLS Policies for influencer_post_likes
CREATE POLICY "Anyone can view post likes"
  ON public.influencer_post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON public.influencer_post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.influencer_post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update followers count
CREATE OR REPLACE FUNCTION public.update_influencer_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.influencer_profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.influencer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.influencer_profiles
    SET followers_count = followers_count - 1
    WHERE id = OLD.influencer_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_influencer_followers_count_trigger
AFTER INSERT OR DELETE ON public.influencer_followers
FOR EACH ROW
EXECUTE FUNCTION public.update_influencer_followers_count();

-- Trigger to update post likes count
CREATE OR REPLACE FUNCTION public.update_influencer_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.influencer_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    
    -- Update total likes for influencer
    UPDATE public.influencer_profiles
    SET total_likes = total_likes + 1
    WHERE id = (SELECT influencer_id FROM public.influencer_posts WHERE id = NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.influencer_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    
    -- Update total likes for influencer
    UPDATE public.influencer_profiles
    SET total_likes = total_likes - 1
    WHERE id = (SELECT influencer_id FROM public.influencer_posts WHERE id = OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_influencer_post_likes_count_trigger
AFTER INSERT OR DELETE ON public.influencer_post_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_influencer_post_likes_count();

-- Triggers for updated_at
CREATE TRIGGER update_influencer_profiles_updated_at
BEFORE UPDATE ON public.influencer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_influencer_posts_updated_at
BEFORE UPDATE ON public.influencer_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();