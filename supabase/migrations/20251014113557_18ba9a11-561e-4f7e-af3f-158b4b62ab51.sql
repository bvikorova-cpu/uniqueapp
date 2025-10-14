-- Create home_designs table
CREATE TABLE IF NOT EXISTS public.home_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  redesigned_image_url TEXT,
  room_type TEXT NOT NULL,
  style_preference TEXT NOT NULL,
  design_prompt TEXT,
  product_suggestions JSONB DEFAULT '[]'::jsonb,
  credits_used INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own designs"
  ON public.home_designs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own designs"
  ON public.home_designs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.home_designs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.home_designs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for home design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-designs', 'home-designs', true)
ON CONFLICT (id) DO NOTHING;