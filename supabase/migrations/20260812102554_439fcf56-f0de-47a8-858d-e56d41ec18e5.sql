DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users update own nightmare avatars') THEN
    CREATE POLICY "Users update own nightmare avatars" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'shadow-nightmare-avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
      WITH CHECK (bucket_id = 'shadow-nightmare-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Nightmare avatars are viewable') THEN
    CREATE POLICY "Nightmare avatars are viewable" ON storage.objects FOR SELECT
      USING (bucket_id = 'shadow-nightmare-avatars');
  END IF;
END $$;