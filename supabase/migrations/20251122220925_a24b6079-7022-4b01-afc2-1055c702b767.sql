-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'cancelled', 'failed')),
  published_post_id UUID REFERENCES public.posts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_spent INTEGER DEFAULT 0,
  peak_engagement_hour INTEGER,
  top_locations TEXT[],
  demographics JSONB,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id)
);

-- Create post_views table for tracking
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  time_spent INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Create collaborative_posts table
CREATE TABLE IF NOT EXISTS public.collaborative_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'contributor' CHECK (role IN ('owner', 'contributor', 'editor')),
  invited_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, collaborator_id)
);

-- Create post_templates table
CREATE TABLE IF NOT EXISTS public.post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  uses_count INTEGER DEFAULT 0,
  thumbnail TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborative_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_templates ENABLE ROW LEVEL SECURITY;

-- Policies for scheduled_posts
CREATE POLICY "Users can view their own scheduled posts"
  ON public.scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create scheduled posts"
  ON public.scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON public.scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON public.scheduled_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for post_analytics
CREATE POLICY "Post owners can view analytics"
  ON public.post_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_analytics.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Policies for post_views
CREATE POLICY "Anyone can insert views"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

-- Policies for collaborative_posts
CREATE POLICY "Collaborators can view their posts"
  ON public.collaborative_posts FOR SELECT
  USING (
    auth.uid() = collaborator_id OR
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = collaborative_posts.post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Post owners can add collaborators"
  ON public.collaborative_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Post owners can update collaborators"
  ON public.collaborative_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id
      AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove themselves or owners can remove anyone"
  ON public.collaborative_posts FOR DELETE
  USING (
    auth.uid() = collaborator_id OR
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Policies for post_templates
CREATE POLICY "Anyone can view public templates"
  ON public.post_templates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON public.post_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.post_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.post_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update scheduled_posts timestamp
CREATE OR REPLACE FUNCTION update_scheduled_posts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to update post_templates timestamp
CREATE OR REPLACE FUNCTION update_post_templates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to update analytics when viewing post
CREATE OR REPLACE FUNCTION update_post_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.post_analytics (post_id, views_count, unique_viewers)
  VALUES (NEW.post_id, 1, 1)
  ON CONFLICT (post_id) 
  DO UPDATE SET
    views_count = post_analytics.views_count + 1,
    unique_viewers = post_analytics.unique_viewers + 
      CASE WHEN NEW.user_id IS NOT NULL THEN 1 ELSE 0 END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON public.scheduled_posts;
CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_timestamp();

DROP TRIGGER IF EXISTS update_post_templates_updated_at ON public.post_templates;
CREATE TRIGGER update_post_templates_updated_at
  BEFORE UPDATE ON public.post_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_post_templates_timestamp();

DROP TRIGGER IF EXISTS trigger_update_post_analytics ON public.post_views;
CREATE TRIGGER trigger_update_post_analytics
  AFTER INSERT ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION update_post_analytics();

-- Insert default post templates
INSERT INTO public.post_templates (name, content, category, is_public, thumbnail, tags) VALUES
  ('Announcement', '🎉 Exciting news! [Your announcement here]', 'general', true, '🎉', ARRAY['announcement', 'news']),
  ('Question', '🤔 Quick question for everyone: [Your question]', 'engagement', true, '🤔', ARRAY['question', 'discussion']),
  ('Achievement', '✨ Just achieved [milestone]! Feeling grateful for [people/things]', 'celebration', true, '✨', ARRAY['achievement', 'milestone']),
  ('Event Invite', '📅 You''re invited! [Event name] on [date] at [location]. Who''s coming?', 'events', true, '📅', ARRAY['event', 'invitation']),
  ('Recommendation', '⭐ Highly recommend [product/service/place] because [reason]', 'recommendation', true, '⭐', ARRAY['recommendation', 'review'])
ON CONFLICT DO NOTHING;