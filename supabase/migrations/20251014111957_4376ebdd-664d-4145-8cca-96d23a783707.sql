-- Create brand_kits table for storing AI-generated brand identities
CREATE TABLE public.brand_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  target_audience TEXT,
  brand_values TEXT,
  logo_url TEXT,
  color_palette JSONB DEFAULT '[]'::jsonb,
  slogan TEXT,
  tagline TEXT,
  social_media_strategy JSONB DEFAULT '{}'::jsonb,
  visual_identity JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER DEFAULT 10,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand kits
CREATE POLICY "Users can view their own brand kits"
  ON public.brand_kits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own brand kits
CREATE POLICY "Users can create their own brand kits"
  ON public.brand_kits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand kits
CREATE POLICY "Users can update their own brand kits"
  ON public.brand_kits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own brand kits
CREATE POLICY "Users can delete their own brand kits"
  ON public.brand_kits
  FOR DELETE
  USING (auth.uid() = user_id);