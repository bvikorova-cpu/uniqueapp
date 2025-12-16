-- Create storage bucket for messenger attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('messenger-attachments', 'messenger-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for messenger attachments
CREATE POLICY "Users can upload messenger attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'messenger-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view messenger attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'messenger-attachments');

CREATE POLICY "Users can delete own messenger attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'messenger-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachment columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS voice_duration INTEGER;