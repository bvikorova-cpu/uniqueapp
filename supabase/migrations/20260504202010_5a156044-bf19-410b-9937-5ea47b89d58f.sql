
INSERT INTO storage.buckets (id, name, public)
VALUES ('kitchen-battles', 'kitchen-battles', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.kitchen_battle_participants
  ADD COLUMN IF NOT EXISTS media_type text CHECK (media_type IN ('image','video')),
  ADD COLUMN IF NOT EXISTS media_size bigint,
  ADD COLUMN IF NOT EXISTS media_mime text;

CREATE POLICY "kb_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'kitchen-battles');

CREATE POLICY "kb_media_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kitchen-battles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "kb_media_user_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'kitchen-battles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "kb_media_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'kitchen-battles' AND auth.uid()::text = (storage.foldername(name))[1]);
