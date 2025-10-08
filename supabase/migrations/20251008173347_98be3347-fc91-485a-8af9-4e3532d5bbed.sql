-- Create storage bucket for destination media
INSERT INTO storage.buckets (id, name, public)
VALUES ('destination-media', 'destination-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for destination media
CREATE POLICY "Anyone can view destination media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'destination-media');

CREATE POLICY "Authenticated users can upload destination media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'destination-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own destination media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'destination-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own destination media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'destination-media' AND auth.uid()::text = (storage.foldername(name))[1]);