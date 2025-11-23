-- Create videos storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Videos are publicly accessible'
  ) THEN
    CREATE POLICY "Videos are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'videos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own videos to storage'
  ) THEN
    CREATE POLICY "Users can upload their own videos to storage"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'videos' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own videos in storage'
  ) THEN
    CREATE POLICY "Users can update their own videos in storage"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'videos' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own videos from storage'
  ) THEN
    CREATE POLICY "Users can delete their own videos from storage"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'videos' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;