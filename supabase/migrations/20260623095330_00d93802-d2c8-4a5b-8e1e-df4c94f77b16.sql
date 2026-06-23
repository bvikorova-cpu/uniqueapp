DROP POLICY IF EXISTS "Authenticated can read messenger attachments" ON storage.objects;
CREATE POLICY "Authenticated can read messenger attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'messenger-attachments');