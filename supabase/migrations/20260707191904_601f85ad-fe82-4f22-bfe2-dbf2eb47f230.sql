
DROP POLICY IF EXISTS "Doctors upload own license" ON storage.objects;
CREATE POLICY "Doctors upload own license"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'doctor-licenses' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Doctors read own license" ON storage.objects;
CREATE POLICY "Doctors read own license"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'doctor-licenses' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));

DROP POLICY IF EXISTS "Doctors update own license" ON storage.objects;
CREATE POLICY "Doctors update own license"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'doctor-licenses' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Doctors delete own license" ON storage.objects;
CREATE POLICY "Doctors delete own license"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'doctor-licenses' AND (storage.foldername(name))[1] = auth.uid()::text);
