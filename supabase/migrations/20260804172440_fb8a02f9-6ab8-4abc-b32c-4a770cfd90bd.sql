DROP POLICY IF EXISTS "time_reversal_media_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "time_reversal_media_update_own" ON storage.objects;
DROP POLICY IF EXISTS "time_reversal_media_delete_own" ON storage.objects;

CREATE POLICY "time_reversal_media_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'time-reversal'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "time_reversal_media_update_own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'time-reversal'
  AND (storage.foldername(name))[3] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'time-reversal'
  AND (storage.foldername(name))[3] = auth.uid()::text
);

CREATE POLICY "time_reversal_media_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = 'time-reversal'
  AND (storage.foldername(name))[3] = auth.uid()::text
);