-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows table

-- Users can view all follows
CREATE POLICY "Users can view all follows"
ON public.follows
FOR SELECT
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_follower_count(UUID);
DROP FUNCTION IF EXISTS public.get_following_count(UUID);

-- Function to get follower count
CREATE FUNCTION public.get_follower_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.follows
    WHERE following_id = user_id
  );
END;
$$;

-- Function to get following count
CREATE FUNCTION public.get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.follows
    WHERE follower_id = user_id
  );
END;
$$;