-- Create table for forum comment likes
CREATE TABLE public.forum_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.forum_comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view comment likes
CREATE POLICY "Anyone can view forum comment likes"
ON public.forum_comment_likes
FOR SELECT
USING (true);

-- Authenticated users can like comments
CREATE POLICY "Authenticated users can like forum comments"
ON public.forum_comment_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike comments
CREATE POLICY "Users can unlike forum comments"
ON public.forum_comment_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Add likes_count column to forum_comments
ALTER TABLE public.forum_comments
ADD COLUMN likes_count INTEGER DEFAULT 0;

-- Create function to update comment likes count
CREATE OR REPLACE FUNCTION public.update_forum_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for comment likes count
CREATE TRIGGER update_forum_comment_likes_count_trigger
AFTER INSERT OR DELETE ON public.forum_comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_forum_comment_likes_count();