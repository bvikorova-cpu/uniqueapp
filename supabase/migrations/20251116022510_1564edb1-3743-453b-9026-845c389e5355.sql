-- Create creator_messages table for direct messaging
CREATE TABLE IF NOT EXISTS public.creator_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
  ON public.creator_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.creator_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes
CREATE INDEX idx_creator_messages_sender ON public.creator_messages(sender_id);
CREATE INDEX idx_creator_messages_receiver ON public.creator_messages(receiver_id);
CREATE INDEX idx_creator_messages_created_at ON public.creator_messages(created_at);

-- Create storage bucket for creator media
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-media', 'creator-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for creator media
CREATE POLICY "Anyone can view creator media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'creator-media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'creator-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'creator-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'creator-media' AND auth.uid()::text = (storage.foldername(name))[1]);