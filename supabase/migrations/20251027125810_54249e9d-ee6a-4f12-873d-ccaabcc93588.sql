-- Create teacher_coloring_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.teacher_coloring_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.teacher_collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_teacher_coloring_pages_collection 
ON public.teacher_coloring_pages(collection_id);

-- Enable RLS
ALTER TABLE public.teacher_coloring_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view coloring pages from their school"
ON public.teacher_coloring_pages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teacher_collections tc
    WHERE tc.id = teacher_coloring_pages.collection_id
    AND tc.school_id IN (
      SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert coloring pages to their collections"
ON public.teacher_coloring_pages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teacher_collections tc
    WHERE tc.id = collection_id
    AND tc.school_id IN (
      SELECT id FROM public.school_profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their coloring pages"
ON public.teacher_coloring_pages
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Create function to increment collection page count
CREATE OR REPLACE FUNCTION public.increment_collection_pages(p_collection_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.teacher_collections
  SET page_count = page_count + 1,
      updated_at = now()
  WHERE id = p_collection_id;
END;
$$;