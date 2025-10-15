-- Create talent_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.talent_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.talent_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on talent_comments
ALTER TABLE public.talent_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Anyone can view comments" ON public.talent_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.talent_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.talent_comments;

-- Create policies for talent_comments
CREATE POLICY "Anyone can view comments"
  ON public.talent_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.talent_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.talent_comments FOR DELETE
  USING (auth.uid() = user_id);