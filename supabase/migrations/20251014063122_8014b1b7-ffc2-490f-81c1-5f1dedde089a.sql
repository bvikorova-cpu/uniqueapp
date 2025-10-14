-- Create content types enum
CREATE TYPE content_type AS ENUM (
  'social_post',
  'blog_article',
  'video_script',
  'cv',
  'cover_letter',
  'business_document'
);

-- Create content status enum
CREATE TYPE content_status AS ENUM ('draft', 'generated', 'edited', 'published');

-- Create table for generated content
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type content_type NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  generated_text TEXT,
  generated_image_url TEXT,
  metadata JSONB DEFAULT '{}',
  status content_status DEFAULT 'draft',
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own content"
  ON public.ai_generated_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content"
  ON public.ai_generated_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON public.ai_generated_content
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON public.ai_generated_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ai_content_user_type ON public.ai_generated_content(user_id, content_type);
CREATE INDEX idx_ai_content_created ON public.ai_generated_content(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_generated_content_updated_at
  BEFORE UPDATE ON public.ai_generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();