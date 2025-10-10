-- Create storage bucket for user audio uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-tracks', 'user-tracks', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user audio uploads
CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Audio files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-tracks');

CREATE POLICY "Users can update their own audio files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-tracks' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add user_id column to tracks table to track who uploaded the track
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policy to allow users to insert their own tracks
CREATE POLICY "Users can insert their own tracks" 
ON public.tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own tracks
CREATE POLICY "Users can update their own tracks" 
ON public.tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to delete their own tracks
CREATE POLICY "Users can delete their own tracks" 
ON public.tracks 
FOR DELETE 
USING (auth.uid() = user_id);