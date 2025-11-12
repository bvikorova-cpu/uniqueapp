-- Create kids story usage tracking table
CREATE TABLE IF NOT EXISTS public.kids_story_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stories_created_this_month INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create kids stories library table
CREATE TABLE IF NOT EXISTS public.kids_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  characters TEXT NOT NULL,
  theme TEXT NOT NULL,
  story_text TEXT NOT NULL,
  illustration_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kids_story_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_stories ENABLE ROW LEVEL SECURITY;

-- RLS policies for kids_story_usage
CREATE POLICY "Users can view their own story usage"
  ON public.kids_story_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own story usage"
  ON public.kids_story_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story usage"
  ON public.kids_story_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for kids_stories
CREATE POLICY "Users can view their own stories"
  ON public.kids_stories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stories"
  ON public.kids_stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
  ON public.kids_stories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.kids_stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kids_story_usage_user_id ON public.kids_story_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_kids_stories_user_id ON public.kids_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_kids_stories_created_at ON public.kids_stories(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_kids_story_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_kids_story_usage_updated_at
  BEFORE UPDATE ON public.kids_story_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_story_updated_at();

CREATE TRIGGER update_kids_stories_updated_at
  BEFORE UPDATE ON public.kids_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_story_updated_at();