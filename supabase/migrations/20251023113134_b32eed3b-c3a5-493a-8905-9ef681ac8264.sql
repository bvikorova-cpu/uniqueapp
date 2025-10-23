-- Create analyzer_credits table for credit management
CREATE TABLE IF NOT EXISTS public.analyzer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 1,
  total_credits_purchased INTEGER NOT NULL DEFAULT 1,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro', 'expert')),
  tier_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create analyses table for storing analysis history
CREATE TABLE IF NOT EXISTS public.vision_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('basic', 'expert')),
  main_identification TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  detailed_info JSONB,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  collection_id UUID,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collections table for organizing analyses
CREATE TABLE IF NOT EXISTS public.analyzer_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for collection_id
ALTER TABLE public.vision_analyses 
  ADD CONSTRAINT fk_collection 
  FOREIGN KEY (collection_id) 
  REFERENCES public.analyzer_collections(id) 
  ON DELETE SET NULL;

-- Create analyzer_chat_messages table for AI follow-up chat
CREATE TABLE IF NOT EXISTS public.analyzer_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.vision_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analyzer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyzer_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyzer_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analyzer_credits
CREATE POLICY "Users can view own credits"
  ON public.analyzer_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.analyzer_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON public.analyzer_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vision_analyses
CREATE POLICY "Users can view own analyses"
  ON public.vision_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.vision_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.vision_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.vision_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for analyzer_collections
CREATE POLICY "Users can view own collections"
  ON public.analyzer_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own collections"
  ON public.analyzer_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.analyzer_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.analyzer_collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for analyzer_chat_messages
CREATE POLICY "Users can view own chat messages"
  ON public.analyzer_chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.analyzer_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_vision_analyses_user_id ON public.vision_analyses(user_id);
CREATE INDEX idx_vision_analyses_category ON public.vision_analyses(category);
CREATE INDEX idx_vision_analyses_created_at ON public.vision_analyses(created_at DESC);
CREATE INDEX idx_analyzer_collections_user_id ON public.analyzer_collections(user_id);
CREATE INDEX idx_analyzer_chat_messages_analysis_id ON public.analyzer_chat_messages(analysis_id);

-- Create function to update analyzer_credits updated_at
CREATE OR REPLACE FUNCTION public.update_analyzer_credits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for analyzer_credits
CREATE TRIGGER update_analyzer_credits_updated_at
  BEFORE UPDATE ON public.analyzer_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analyzer_credits_timestamp();

-- Create function to update analyzer_collections updated_at
CREATE OR REPLACE FUNCTION public.update_analyzer_collections_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for analyzer_collections
CREATE TRIGGER update_analyzer_collections_updated_at
  BEFORE UPDATE ON public.analyzer_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analyzer_collections_timestamp();