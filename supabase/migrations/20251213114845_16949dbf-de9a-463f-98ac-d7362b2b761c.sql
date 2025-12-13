-- Create storage bucket for creator media (avatars and covers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-media', 'creator-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to creator-media bucket
CREATE POLICY "Users can upload their creator media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creator-media' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to creator media
CREATE POLICY "Creator media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'creator-media');

-- Allow users to update their own creator media
CREATE POLICY "Users can update their creator media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'creator-media' AND auth.role() = 'authenticated');

-- Allow users to delete their own creator media
CREATE POLICY "Users can delete their creator media"
ON storage.objects FOR DELETE
USING (bucket_id = 'creator-media' AND auth.role() = 'authenticated');