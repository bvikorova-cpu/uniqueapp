
CREATE POLICY "Public read for promotions bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'promotions');

CREATE POLICY "Users upload to own folder in promotions"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'promotions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own files in promotions"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'promotions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own files in promotions"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'promotions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
