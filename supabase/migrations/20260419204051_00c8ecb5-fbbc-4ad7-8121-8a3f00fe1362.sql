-- Create storage bucket for voice intros
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-intros', 'voice-intros', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read voice intros
CREATE POLICY "Voice intros are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-intros');

-- Users can upload their own
CREATE POLICY "Users can upload their own voice intro"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own voice intro"
ON storage.objects FOR UPDATE
USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice intro"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure one intro per user
ALTER TABLE public.profile_voice_intros
  DROP CONSTRAINT IF EXISTS profile_voice_intros_user_id_key;
ALTER TABLE public.profile_voice_intros
  ADD CONSTRAINT profile_voice_intros_user_id_key UNIQUE (user_id);