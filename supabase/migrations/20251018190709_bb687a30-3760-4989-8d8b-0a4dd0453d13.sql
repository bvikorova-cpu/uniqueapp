-- Create coloring credits table
CREATE TABLE IF NOT EXISTS public.coloring_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'none' CHECK (tier IN ('none', 'basic', 'premium')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coloring pages table
CREATE TABLE IF NOT EXISTS public.coloring_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  processed_image_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  is_public BOOLEAN DEFAULT false,
  credits_used INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coloring_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coloring_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coloring_credits
CREATE POLICY "Users can view their own credits"
  ON public.coloring_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.coloring_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.coloring_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for coloring_pages
CREATE POLICY "Users can view their own coloring pages"
  ON public.coloring_pages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public coloring pages"
  ON public.coloring_pages FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own coloring pages"
  ON public.coloring_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coloring pages"
  ON public.coloring_pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coloring pages"
  ON public.coloring_pages FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_coloring_credits_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_coloring_credits_updated_at
  BEFORE UPDATE ON public.coloring_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coloring_credits_updated_at();

CREATE OR REPLACE FUNCTION public.update_coloring_pages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_coloring_pages_updated_at
  BEFORE UPDATE ON public.coloring_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coloring_pages_updated_at();