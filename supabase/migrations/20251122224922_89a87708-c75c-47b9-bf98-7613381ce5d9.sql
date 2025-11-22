-- Post Drafts
CREATE TABLE IF NOT EXISTS public.post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT,
  media_urls TEXT[],
  draft_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their drafts"
  ON public.post_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their drafts"
  ON public.post_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their drafts"
  ON public.post_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their drafts"
  ON public.post_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_post_drafts_user ON public.post_drafts(user_id);

-- Photo Tags
CREATE TABLE IF NOT EXISTS public.photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tagged_user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  x_position DECIMAL(5,2),
  y_position DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.photo_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photo tags"
  ON public.photo_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can create photo tags"
  ON public.photo_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photo tags"
  ON public.photo_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_id AND posts.user_id = auth.uid()
  ) OR auth.uid() = tagged_user_id);

CREATE INDEX idx_photo_tags_post ON public.photo_tags(post_id);
CREATE INDEX idx_photo_tags_user ON public.photo_tags(tagged_user_id);

-- Post Collaborators
CREATE TABLE IF NOT EXISTS public.post_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, collaborator_id)
);

ALTER TABLE public.post_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collaborators"
  ON public.post_collaborators FOR SELECT
  USING (true);

CREATE POLICY "Post owners can invite collaborators"
  ON public.post_collaborators FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_id AND posts.user_id = auth.uid()
  ));

CREATE POLICY "Collaborators can update their status"
  ON public.post_collaborators FOR UPDATE
  USING (auth.uid() = collaborator_id);

CREATE INDEX idx_post_collaborators_post ON public.post_collaborators(post_id);
CREATE INDEX idx_post_collaborators_user ON public.post_collaborators(collaborator_id);