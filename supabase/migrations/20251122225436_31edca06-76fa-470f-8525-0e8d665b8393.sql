-- User Verification
CREATE TABLE IF NOT EXISTS public.user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  verification_type TEXT DEFAULT 'none',
  verified_at TIMESTAMPTZ,
  verification_badge TEXT,
  documents_submitted BOOLEAN DEFAULT false,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verification"
  ON public.user_verification FOR SELECT
  USING (true);

CREATE POLICY "Users can view their verification"
  ON public.user_verification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their verification"
  ON public.user_verification FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_verification_user ON public.user_verification(user_id);

-- Saved Collections
CREATE TABLE IF NOT EXISTS public.saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their collections"
  ON public.saved_collections FOR SELECT
  USING (auth.uid() = user_id OR is_private = false);

CREATE POLICY "Users can create collections"
  ON public.saved_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their collections"
  ON public.saved_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their collections"
  ON public.saved_collections FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_collections_user ON public.saved_collections(user_id);

-- Collection Items
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.saved_collections(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, post_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collection items"
  ON public.collection_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.saved_collections 
    WHERE saved_collections.id = collection_id 
    AND (saved_collections.user_id = auth.uid() OR saved_collections.is_private = false)
  ));

CREATE POLICY "Users can add to their collections"
  ON public.collection_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.saved_collections 
    WHERE saved_collections.id = collection_id AND saved_collections.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove from their collections"
  ON public.collection_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.saved_collections 
    WHERE saved_collections.id = collection_id AND saved_collections.user_id = auth.uid()
  ));

CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_post ON public.collection_items(post_id);

-- Post Highlights
CREATE TABLE IF NOT EXISTS public.post_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  highlight_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.post_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view highlights"
  ON public.post_highlights FOR SELECT
  USING (true);

CREATE POLICY "Users can create their highlights"
  ON public.post_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their highlights"
  ON public.post_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their highlights"
  ON public.post_highlights FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_post_highlights_user ON public.post_highlights(user_id);
CREATE INDEX idx_post_highlights_post ON public.post_highlights(post_id);

-- User Interests
CREATE TABLE IF NOT EXISTS public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  interest TEXT NOT NULL,
  interest_level INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, interest)
);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interests"
  ON public.user_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their interests"
  ON public.user_interests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their interests"
  ON public.user_interests FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);
CREATE INDEX idx_user_interests_interest ON public.user_interests(interest);