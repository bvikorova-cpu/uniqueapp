-- Create beauty_transformations table for storing AI beauty edits
CREATE TABLE public.beauty_transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT NOT NULL,
  transformation_type TEXT NOT NULL, -- 'makeup', 'hair', 'nails', 'complete'
  style_applied TEXT NOT NULL, -- 'glam', 'natural', 'smokey', 'blonde', 'red', etc.
  description TEXT,
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create beauty_product_recommendations table
CREATE TABLE public.beauty_product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skin_type TEXT,
  hair_type TEXT,
  concerns TEXT[],
  recommendations JSONB DEFAULT '[]'::jsonb,
  credits_used INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create beauty_tutorials table
CREATE TABLE public.beauty_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  look_description TEXT NOT NULL,
  tutorial_steps JSONB DEFAULT '[]'::jsonb,
  products_needed JSONB DEFAULT '[]'::jsonb,
  difficulty_level TEXT,
  credits_used INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beauty_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beauty_tutorials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for beauty_transformations
CREATE POLICY "Users can view their own transformations"
  ON public.beauty_transformations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transformations"
  ON public.beauty_transformations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for beauty_product_recommendations
CREATE POLICY "Users can view their own recommendations"
  ON public.beauty_product_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations"
  ON public.beauty_product_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for beauty_tutorials
CREATE POLICY "Users can view their own tutorials"
  ON public.beauty_tutorials
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tutorials"
  ON public.beauty_tutorials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);