
CREATE TABLE IF NOT EXISTS public.property_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 4000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pmsg_thread ON public.property_messages(property_id, buyer_id, seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pmsg_buyer ON public.property_messages(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pmsg_seller ON public.property_messages(seller_id, created_at DESC);

ALTER TABLE public.property_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Thread participants can view messages"
ON public.property_messages FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants can send messages in their own thread"
ON public.property_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (auth.uid() = buyer_id OR auth.uid() = seller_id)
  AND buyer_id <> seller_id
);

CREATE POLICY "Recipients can mark messages as read"
ON public.property_messages FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.property_messages;
ALTER TABLE public.property_messages REPLICA IDENTITY FULL;
