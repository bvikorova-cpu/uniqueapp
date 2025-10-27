-- Create tables for Teacher Dashboard functionality

-- School profiles table
CREATE TABLE IF NOT EXISTS public.school_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT,
  school_logo_url TEXT,
  subscription_tier TEXT DEFAULT 'none',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Collections table
CREATE TABLE IF NOT EXISTS public.teacher_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.school_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  page_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collection pages table
CREATE TABLE IF NOT EXISTS public.collection_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.teacher_collections(id) ON DELETE CASCADE,
  coloring_page_id UUID NOT NULL REFERENCES public.coloring_pages(id) ON DELETE CASCADE,
  page_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, coloring_page_id)
);

-- School team members table
CREATE TABLE IF NOT EXISTS public.school_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.school_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  UNIQUE(school_id, user_id)
);

-- Enable RLS
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for school_profiles
CREATE POLICY "Users can view their own school profile"
ON public.school_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own school profile"
ON public.school_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own school profile"
ON public.school_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for teacher_collections
CREATE POLICY "School owners can view their collections"
ON public.teacher_collections FOR SELECT
USING (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "School owners can create collections"
ON public.teacher_collections FOR INSERT
WITH CHECK (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "School owners can update their collections"
ON public.teacher_collections FOR UPDATE
USING (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "School owners can delete their collections"
ON public.teacher_collections FOR DELETE
USING (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for collection_pages
CREATE POLICY "School owners can view collection pages"
ON public.collection_pages FOR SELECT
USING (
  collection_id IN (
    SELECT tc.id FROM public.teacher_collections tc
    JOIN public.school_profiles sp ON tc.school_id = sp.id
    WHERE sp.user_id = auth.uid()
  )
);

CREATE POLICY "School owners can manage collection pages"
ON public.collection_pages FOR ALL
USING (
  collection_id IN (
    SELECT tc.id FROM public.teacher_collections tc
    JOIN public.school_profiles sp ON tc.school_id = sp.id
    WHERE sp.user_id = auth.uid()
  )
);

-- RLS Policies for school_team_members
CREATE POLICY "School owners can view their team"
ON public.school_team_members FOR SELECT
USING (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "School owners can manage their team"
ON public.school_team_members FOR ALL
USING (
  school_id IN (
    SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_teacher_dashboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_school_profiles_updated_at
BEFORE UPDATE ON public.school_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_teacher_dashboard_updated_at();

CREATE TRIGGER update_teacher_collections_updated_at
BEFORE UPDATE ON public.teacher_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_teacher_dashboard_updated_at();