
-- Helper: patient-scoped folder policies for private buckets
DO $$ BEGIN
  -- prescriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rx_owner_read' AND schemaname='storage') THEN
    CREATE POLICY "rx_owner_read" ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id='prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rx_owner_write' AND schemaname='storage') THEN
    CREATE POLICY "rx_owner_write" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id='prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  -- medical-attachments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ma_owner_all' AND schemaname='storage') THEN
    CREATE POLICY "ma_owner_all" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id='medical-attachments' AND (storage.foldername(name))[1] = auth.uid()::text)
      WITH CHECK (bucket_id='medical-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  -- insurance-cards
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='ic_owner_all' AND schemaname='storage') THEN
    CREATE POLICY "ic_owner_all" ON storage.objects FOR ALL TO authenticated
      USING (bucket_id='insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text)
      WITH CHECK (bucket_id='insurance-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
