-- Create table for AI-generated songs
CREATE TABLE public.ai_generated_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  lyrics TEXT,
  genre TEXT NOT NULL,
  mood TEXT,
  tempo INTEGER,
  duration INTEGER,
  song_url TEXT,
  cover_art_url TEXT,
  is_remix BOOLEAN DEFAULT false,
  original_song_reference TEXT,
  credits_used INTEGER DEFAULT 15,
  status TEXT DEFAULT 'generating',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generated_songs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own songs"
  ON public.ai_generated_songs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own songs"
  ON public.ai_generated_songs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs"
  ON public.ai_generated_songs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
  ON public.ai_generated_songs
  FOR DELETE
  USING (auth.uid() = user_id);