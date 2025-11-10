-- Create healthcare_collections table for organizing coloring pages
CREATE TABLE IF NOT EXISTS public.healthcare_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  healthcare_profile_id UUID REFERENCES public.healthcare_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- anxiety, pain, emotional, social
  age_group TEXT, -- 0-3, 3-6, 6-12, 13+
  medical_specialty TEXT, -- pediatric, dental, therapy, etc
  page_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create healthcare_coloring_pages table for individual pages
CREATE TABLE IF NOT EXISTS public.healthcare_coloring_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.healthcare_collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  pdf_url TEXT,
  thumbnail_url TEXT,
  difficulty_level TEXT, -- easy, medium, hard
  therapeutic_purpose TEXT, -- anxiety_reduction, pain_distraction, etc
  tags TEXT[],
  download_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create healthcare_team_members table
CREATE TABLE IF NOT EXISTS public.healthcare_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  healthcare_profile_id UUID NOT NULL REFERENCES public.healthcare_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- admin, member, viewer
  added_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(healthcare_profile_id, user_id)
);

-- Enable RLS
ALTER TABLE public.healthcare_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_coloring_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for healthcare_collections
CREATE POLICY "Providers can view their own collections"
  ON public.healthcare_collections FOR SELECT
  USING (
    provider_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.healthcare_team_members 
      WHERE healthcare_team_members.healthcare_profile_id = healthcare_collections.healthcare_profile_id 
      AND healthcare_team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can create collections"
  ON public.healthcare_collections FOR INSERT
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update their collections"
  ON public.healthcare_collections FOR UPDATE
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can delete their collections"
  ON public.healthcare_collections FOR DELETE
  USING (provider_id = auth.uid());

-- RLS Policies for healthcare_coloring_pages
CREATE POLICY "Users can view pages from their collections"
  ON public.healthcare_coloring_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.healthcare_collections c
      WHERE c.id = healthcare_coloring_pages.collection_id
      AND (c.provider_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.healthcare_team_members tm
        WHERE tm.healthcare_profile_id = c.healthcare_profile_id
        AND tm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Users can create pages in their collections"
  ON public.healthcare_coloring_pages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.healthcare_collections c
      WHERE c.id = healthcare_coloring_pages.collection_id
      AND c.provider_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in their collections"
  ON public.healthcare_coloring_pages FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete pages in their collections"
  ON public.healthcare_coloring_pages FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for healthcare_team_members
CREATE POLICY "Team members can view their team"
  ON public.healthcare_team_members FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.healthcare_profiles hp
      WHERE hp.id = healthcare_team_members.healthcare_profile_id
      AND hp.user_id = auth.uid()
    )
  );

CREATE POLICY "Profile owners can manage team members"
  ON public.healthcare_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.healthcare_profiles hp
      WHERE hp.id = healthcare_team_members.healthcare_profile_id
      AND hp.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_healthcare_collections_updated_at
  BEFORE UPDATE ON public.healthcare_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_coloring_pages_updated_at
  BEFORE UPDATE ON public.healthcare_coloring_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment collection page count
CREATE OR REPLACE FUNCTION increment_healthcare_collection_pages(p_collection_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.healthcare_collections
  SET page_count = page_count + 1,
      updated_at = now()
  WHERE id = p_collection_id;
END;
$$;

-- Indexes
CREATE INDEX idx_healthcare_collections_provider ON public.healthcare_collections(provider_id);
CREATE INDEX idx_healthcare_collections_profile ON public.healthcare_collections(healthcare_profile_id);
CREATE INDEX idx_healthcare_coloring_pages_collection ON public.healthcare_coloring_pages(collection_id);
CREATE INDEX idx_healthcare_team_members_profile ON public.healthcare_team_members(healthcare_profile_id);
CREATE INDEX idx_healthcare_team_members_user ON public.healthcare_team_members(user_id);