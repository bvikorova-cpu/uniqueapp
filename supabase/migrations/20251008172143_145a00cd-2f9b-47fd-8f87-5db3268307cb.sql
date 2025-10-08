-- Create table for forum comments
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view active comments
CREATE POLICY "Anyone can view active forum comments"
ON public.forum_comments
FOR SELECT
USING (is_active = true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create forum comments"
ON public.forum_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own forum comments"
ON public.forum_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own forum comments"
ON public.forum_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update replies count
CREATE OR REPLACE FUNCTION public.update_forum_post_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts
    SET replies_count = replies_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts
    SET replies_count = replies_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for replies count
CREATE TRIGGER update_forum_post_replies_count_trigger
AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_forum_post_replies_count();