-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0
);

-- Create story_views table
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Create story_reactions table
CREATE TABLE IF NOT EXISTS public.story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Create story_polls table
CREATE TABLE IF NOT EXISTS public.story_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  votes_a INTEGER DEFAULT 0,
  votes_b INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create story_poll_votes table
CREATE TABLE IF NOT EXISTS public.story_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.story_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('a', 'b')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view active stories from friends"
  ON public.stories FOR SELECT
  USING (
    is_active = true 
    AND expires_at > now()
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.friendships
        WHERE ((user_id = auth.uid() AND friend_id = stories.user_id)
            OR (friend_id = auth.uid() AND user_id = stories.user_id))
        AND status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for story_views
CREATE POLICY "Users can view story views"
  ON public.story_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE id = story_views.story_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can record their views"
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for story_reactions
CREATE POLICY "Anyone can view story reactions"
  ON public.story_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON public.story_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reactions"
  ON public.story_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for story_polls
CREATE POLICY "Anyone can view polls"
  ON public.story_polls FOR SELECT
  USING (true);

CREATE POLICY "Story owners can create polls"
  ON public.story_polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE id = story_polls.story_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for story_poll_votes
CREATE POLICY "Anyone can view poll votes"
  ON public.story_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on polls"
  ON public.story_poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX idx_stories_is_active ON public.stories(is_active);
CREATE INDEX idx_story_views_story ON public.story_views(story_id);
CREATE INDEX idx_story_reactions_story ON public.story_reactions(story_id);
CREATE INDEX idx_story_polls_story ON public.story_polls(story_id);

-- Function to update views count
CREATE OR REPLACE FUNCTION public.update_story_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.stories
  SET views_count = views_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update poll votes
CREATE OR REPLACE FUNCTION public.update_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote = 'a' THEN
    UPDATE public.story_polls
    SET votes_a = votes_a + 1
    WHERE id = NEW.poll_id;
  ELSE
    UPDATE public.story_polls
    SET votes_b = votes_b + 1
    WHERE id = NEW.poll_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER update_story_views_count_trigger
  AFTER INSERT ON public.story_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_story_views_count();

CREATE TRIGGER update_poll_votes_trigger
  AFTER INSERT ON public.story_poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_votes();