
-- Create the user-uploads storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to user-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public read access for user-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads in user-uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
