-- Create bazaar_messages table for contacting sellers
CREATE TABLE IF NOT EXISTS public.bazaar_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.bazaar_items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bazaar_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can send messages"
  ON public.bazaar_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their sent messages"
  ON public.bazaar_messages
  FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view their received messages"
  ON public.bazaar_messages
  FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can update their received messages"
  ON public.bazaar_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);