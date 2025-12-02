-- Create handwriting credits table
CREATE TABLE IF NOT EXISTS public.handwriting_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handwriting_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for handwriting_credits
CREATE POLICY "Users can view their own credits"
  ON public.handwriting_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.handwriting_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.handwriting_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Create handwriting analyses table
CREATE TABLE IF NOT EXISTS public.handwriting_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('personal', 'professional', 'relationship', 'business')),
  credits_used INTEGER NOT NULL DEFAULT 5,
  
  -- Analysis results
  personality_traits JSONB,
  strengths TEXT[],
  weaknesses TEXT[],
  emotional_state TEXT,
  communication_style TEXT,
  work_approach TEXT,
  relationship_patterns TEXT,
  decision_making TEXT,
  stress_indicators TEXT,
  creativity_level TEXT,
  leadership_qualities TEXT,
  detailed_analysis TEXT,
  recommendations TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.handwriting_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for handwriting_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.handwriting_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.handwriting_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_handwriting_analyses_user_id ON public.handwriting_analyses(user_id);
CREATE INDEX idx_handwriting_credits_user_id ON public.handwriting_credits(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_handwriting_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_handwriting_credits_timestamp
  BEFORE UPDATE ON public.handwriting_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_handwriting_credits_updated_at();