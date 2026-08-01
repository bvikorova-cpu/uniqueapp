DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='home_designs_public_read') THEN
    CREATE POLICY "home_designs_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'home-designs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='home_designs_user_insert') THEN
    CREATE POLICY "home_designs_user_insert" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'home-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='home_designs_user_update') THEN
    CREATE POLICY "home_designs_user_update" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'home-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='home_designs_user_delete') THEN
    CREATE POLICY "home_designs_user_delete" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'home-designs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;