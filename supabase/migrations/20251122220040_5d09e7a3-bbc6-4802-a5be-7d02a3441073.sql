-- Create story_highlights table
CREATE TABLE IF NOT EXISTS public.story_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create story_highlight_posts table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.story_highlight_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id UUID NOT NULL REFERENCES public.story_highlights(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(highlight_id, post_id)
);

-- Create feed_preferences table
CREATE TABLE IF NOT EXISTS public.feed_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  hidden_users UUID[] DEFAULT ARRAY[]::UUID[],
  sort_preference TEXT DEFAULT 'smart',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.story_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_highlight_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for story_highlights
CREATE POLICY "Users can view all story highlights"
  ON public.story_highlights FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own highlights"
  ON public.story_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
  ON public.story_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
  ON public.story_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for story_highlight_posts
CREATE POLICY "Anyone can view highlight posts"
  ON public.story_highlight_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can add posts to their highlights"
  ON public.story_highlight_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.story_highlights
      WHERE id = highlight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove posts from their highlights"
  ON public.story_highlight_posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.story_highlights
      WHERE id = highlight_id AND user_id = auth.uid()
    )
  );

-- Policies for feed_preferences
CREATE POLICY "Users can view their own feed preferences"
  ON public.feed_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed preferences"
  ON public.feed_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed preferences"
  ON public.feed_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert new achievements (using ON CONFLICT to avoid duplicates)
INSERT INTO public.achievements (code, name, description, icon, points) VALUES
  ('photographer', 'Photographer', 'Shared 25 photos', '📸', 20),
  ('storyteller', 'Storyteller', 'Created 10 story highlights', '📚', 25),
  ('influencer', 'Influencer', 'Reached 1000 followers', '🌟', 100)
ON CONFLICT (code) DO NOTHING;

-- Function to update story_highlights updated_at
CREATE OR REPLACE FUNCTION update_story_highlight_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for story_highlights
DROP TRIGGER IF EXISTS update_story_highlights_updated_at ON public.story_highlights;
CREATE TRIGGER update_story_highlights_updated_at
  BEFORE UPDATE ON public.story_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_story_highlight_updated_at();