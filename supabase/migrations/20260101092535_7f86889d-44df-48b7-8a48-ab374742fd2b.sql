-- Create storage bucket for cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for cover images
CREATE POLICY "Anyone can view cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload cover images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own cover images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover images"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);