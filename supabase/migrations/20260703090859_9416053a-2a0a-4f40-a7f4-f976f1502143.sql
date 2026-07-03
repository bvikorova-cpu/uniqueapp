
CREATE POLICY "eco-media public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'eco-media');
CREATE POLICY "eco-media authenticated upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'eco-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "eco-media owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'eco-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "eco-media owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'eco-media' AND (storage.foldername(name))[1] = auth.uid()::text);
