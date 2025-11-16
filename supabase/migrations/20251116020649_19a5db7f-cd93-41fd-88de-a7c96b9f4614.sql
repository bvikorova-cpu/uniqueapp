-- Create creator_post_likes table
CREATE TABLE IF NOT EXISTS public.creator_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.creator_exclusive_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.creator_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can like posts"
  ON public.creator_post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all likes"
  ON public.creator_post_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can unlike their own likes"
  ON public.creator_post_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_creator_post_likes_post_id ON public.creator_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_creator_post_likes_user_id ON public.creator_post_likes(post_id, user_id);