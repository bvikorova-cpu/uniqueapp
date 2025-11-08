-- Create reposts table
CREATE TABLE IF NOT EXISTS public.reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view reposts
CREATE POLICY "Reposts are viewable by everyone"
  ON public.reposts
  FOR SELECT
  USING (true);

-- Policy: Users can create their own reposts
CREATE POLICY "Users can create their own reposts"
  ON public.reposts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reposts
CREATE POLICY "Users can update their own reposts"
  ON public.reposts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own reposts
CREATE POLICY "Users can delete their own reposts"
  ON public.reposts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_reposts_user_id ON public.reposts(user_id);
CREATE INDEX idx_reposts_original_post_id ON public.reposts(original_post_id);
CREATE INDEX idx_reposts_created_at ON public.reposts(created_at DESC);

-- Add reposts_count column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS reposts_count INTEGER NOT NULL DEFAULT 0;

-- Function to update reposts count
CREATE OR REPLACE FUNCTION public.update_post_reposts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET reposts_count = reposts_count + 1
    WHERE id = NEW.original_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET reposts_count = GREATEST(reposts_count - 1, 0)
    WHERE id = OLD.original_post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for reposts count
DROP TRIGGER IF EXISTS trigger_update_post_reposts_count ON public.reposts;
CREATE TRIGGER trigger_update_post_reposts_count
  AFTER INSERT OR DELETE ON public.reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_reposts_count();