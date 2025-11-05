-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own voice clones" ON public.voice_clones;
DROP POLICY IF EXISTS "Users can create their own voice clones" ON public.voice_clones;
DROP POLICY IF EXISTS "Users can update their own voice clones" ON public.voice_clones;
DROP POLICY IF EXISTS "Users can delete their own voice clones" ON public.voice_clones;

-- Recreate policies for voice_clones
CREATE POLICY "Users can view their own voice clones"
  ON public.voice_clones
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice clones"
  ON public.voice_clones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice clones"
  ON public.voice_clones
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice clones"
  ON public.voice_clones
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for voice memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-memories', 'voice-memories', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can view their own voice memories" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own voice memories" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice memories" ON storage.objects;

-- Recreate storage policies for voice-memories bucket
CREATE POLICY "Users can view their own voice memories"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'voice-memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own voice memories"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own voice memories"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'voice-memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );