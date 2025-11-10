-- Create table for storing created characters
CREATE TABLE IF NOT EXISTS public.created_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hair_color TEXT NOT NULL,
  superpower TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.created_characters ENABLE ROW LEVEL SECURITY;

-- Users can view their own characters
CREATE POLICY "Users can view their own characters"
  ON public.created_characters
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own characters
CREATE POLICY "Users can insert their own characters"
  ON public.created_characters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own characters
CREATE POLICY "Users can delete their own characters"
  ON public.created_characters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_created_characters_user_id ON public.created_characters(user_id);
CREATE INDEX idx_created_characters_created_at ON public.created_characters(created_at DESC);