
-- video-resumes: owner full + authenticated read for public flagged
DROP POLICY IF EXISTS "video_resumes owner read" ON storage.objects;
DROP POLICY IF EXISTS "video_resumes owner write" ON storage.objects;
DROP POLICY IF EXISTS "video_resumes owner update" ON storage.objects;
DROP POLICY IF EXISTS "video_resumes owner delete" ON storage.objects;
DROP POLICY IF EXISTS "video_resumes public read" ON storage.objects;

CREATE POLICY "video_resumes owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'video-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "video_resumes owner write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'video-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "video_resumes owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'video-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "video_resumes owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'video-resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "video_resumes public read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'video-resumes'
    AND EXISTS (
      SELECT 1 FROM public.video_resumes vr
      WHERE vr.is_public = true
        AND (vr.video_url LIKE '%/video-resumes/' || storage.objects.name
             OR vr.video_url LIKE '%/video-resumes/' || storage.objects.name || '?%')
    )
  );

-- voice-memories: owner only
DROP POLICY IF EXISTS "voice_memories owner all" ON storage.objects;
CREATE POLICY "voice_memories owner all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'voice-memories' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'voice-memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- anonymous-date-voice: owner only
DROP POLICY IF EXISTS "anon_date_voice owner all" ON storage.objects;
CREATE POLICY "anon_date_voice owner all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'anonymous-date-voice' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'anonymous-date-voice' AND (storage.foldername(name))[1] = auth.uid()::text);
