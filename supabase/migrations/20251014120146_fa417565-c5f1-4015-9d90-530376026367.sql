-- Create storage bucket for beauty photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('beauty-photos', 'beauty-photos', true);

-- Create storage policies for beauty photos
CREATE POLICY "Anyone can view beauty photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'beauty-photos');

CREATE POLICY "Authenticated users can upload beauty photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'beauty-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own beauty photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'beauty-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own beauty photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'beauty-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);