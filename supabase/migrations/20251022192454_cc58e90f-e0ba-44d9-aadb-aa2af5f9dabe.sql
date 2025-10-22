-- Create antique credits table
CREATE TABLE IF NOT EXISTS public.antique_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.antique_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for antique_credits
CREATE POLICY "Users can view own antique credits"
  ON public.antique_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own antique credits"
  ON public.antique_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own antique credits"
  ON public.antique_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create antiques table
CREATE TABLE IF NOT EXISTS public.antiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  analysis_type TEXT NOT NULL, -- 'basic', 'valuation', 'expert', 'authenticity', 'history'
  analysis_result JSONB,
  estimated_value NUMERIC,
  estimated_period TEXT,
  style TEXT,
  authenticity_score INTEGER,
  historical_context TEXT,
  market_trends JSONB,
  condition_analysis TEXT,
  restoration_advice TEXT,
  credits_used INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  collection_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.antiques ENABLE ROW LEVEL SECURITY;

-- RLS policies for antiques
CREATE POLICY "Users can view own antiques"
  ON public.antiques
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own antiques"
  ON public.antiques
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own antiques"
  ON public.antiques
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own antiques"
  ON public.antiques
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create antique collections table
CREATE TABLE IF NOT EXISTS public.antique_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  item_count INTEGER DEFAULT 0,
  total_estimated_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.antique_collections ENABLE ROW LEVEL SECURITY;

-- RLS policies for antique_collections
CREATE POLICY "Users can view own collections"
  ON public.antique_collections
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own collections"
  ON public.antique_collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.antique_collections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.antique_collections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for antiques
INSERT INTO storage.buckets (id, name, public)
VALUES ('antiques', 'antiques', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own antique photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'antiques' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view antique photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'antiques');

CREATE POLICY "Users can update own antique photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'antiques' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own antique photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'antiques' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updated_at
CREATE TRIGGER update_antique_credits_updated_at
  BEFORE UPDATE ON public.antique_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_antiques_updated_at
  BEFORE UPDATE ON public.antiques
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_antique_collections_updated_at
  BEFORE UPDATE ON public.antique_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();