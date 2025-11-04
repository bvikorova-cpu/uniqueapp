-- Create table for Time Reversal profiles
CREATE TABLE IF NOT EXISTS public.time_reversal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_age DECIMAL(5,2) DEFAULT 80.00 CHECK (current_age >= 0 AND current_age <= 120),
  starting_age DECIMAL(5,2) DEFAULT 80.00,
  target_age DECIMAL(5,2) DEFAULT 20.00,
  aging_speed DECIMAL(5,2) DEFAULT 1.00,
  last_age_update TIMESTAMPTZ DEFAULT now(),
  age_locks JSONB DEFAULT '[]'::jsonb,
  profile_image_url TEXT,
  bio TEXT,
  follower_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for time reversal posts
CREATE TABLE IF NOT EXISTS public.time_reversal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age_at_post DECIMAL(5,2) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_paradox BOOLEAN DEFAULT false,
  paradox_age DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for followers
CREATE TABLE IF NOT EXISTS public.time_reversal_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create table for likes
CREATE TABLE IF NOT EXISTS public.time_reversal_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.time_reversal_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.time_reversal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_reversal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_reversal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_reversal_likes ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (everyone can view, users can update their own)
CREATE POLICY "Profiles are viewable by everyone"
ON public.time_reversal_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.time_reversal_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.time_reversal_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Policies for posts (everyone can view, users can create/update/delete their own)
CREATE POLICY "Posts are viewable by everyone"
ON public.time_reversal_posts
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.time_reversal_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.time_reversal_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.time_reversal_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Policies for followers
CREATE POLICY "Everyone can view followers"
ON public.time_reversal_followers
FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.time_reversal_followers
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.time_reversal_followers
FOR DELETE
USING (auth.uid() = follower_id);

-- Policies for likes
CREATE POLICY "Everyone can view likes"
ON public.time_reversal_likes
FOR SELECT
USING (true);

CREATE POLICY "Users can like posts"
ON public.time_reversal_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.time_reversal_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update follower count
CREATE OR REPLACE FUNCTION public.update_time_reversal_follower_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.time_reversal_profiles
    SET follower_count = follower_count + 1
    WHERE user_id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.time_reversal_profiles
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE user_id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for follower count
DROP TRIGGER IF EXISTS update_time_reversal_followers_count ON public.time_reversal_followers;
CREATE TRIGGER update_time_reversal_followers_count
AFTER INSERT OR DELETE ON public.time_reversal_followers
FOR EACH ROW
EXECUTE FUNCTION public.update_time_reversal_follower_count();

-- Function to update post likes count
CREATE OR REPLACE FUNCTION public.update_time_reversal_post_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.time_reversal_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.time_reversal_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for post likes
DROP TRIGGER IF EXISTS update_time_reversal_post_likes_trigger ON public.time_reversal_likes;
CREATE TRIGGER update_time_reversal_post_likes_trigger
AFTER INSERT OR DELETE ON public.time_reversal_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_time_reversal_post_likes();