-- Create AI Studio credits table
CREATE TABLE public.ai_studio_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.ai_studio_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own credits"
ON public.ai_studio_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
ON public.ai_studio_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.ai_studio_credits FOR UPDATE
USING (auth.uid() = user_id);

-- Create AI Studio transformations history table
CREATE TABLE public.ai_studio_transformations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  transformed_image_url TEXT,
  transformation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_studio_transformations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transformations"
ON public.ai_studio_transformations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transformations"
ON public.ai_studio_transformations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transformations"
ON public.ai_studio_transformations FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_studio_credits_updated_at
BEFORE UPDATE ON public.ai_studio_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for AI studio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-studio', 'ai-studio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload to ai-studio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-studio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view ai-studio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-studio');