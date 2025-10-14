-- Create AI Tattoo Designs table
CREATE TABLE IF NOT EXISTS public.ai_tattoo_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  placement TEXT,
  size TEXT,
  color_scheme TEXT,
  design_url TEXT,
  preview_url TEXT,
  credits_used INTEGER DEFAULT 8,
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_tattoo_designs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own tattoo designs"
  ON public.ai_tattoo_designs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tattoo designs"
  ON public.ai_tattoo_designs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tattoo designs"
  ON public.ai_tattoo_designs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tattoo designs"
  ON public.ai_tattoo_designs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ai_tattoo_designs_user_id ON public.ai_tattoo_designs(user_id);
CREATE INDEX idx_ai_tattoo_designs_created_at ON public.ai_tattoo_designs(created_at DESC);