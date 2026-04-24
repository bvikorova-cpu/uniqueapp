DROP POLICY IF EXISTS "chat_public_read" ON public.brand_chat_messages;

CREATE POLICY "Authenticated users can read brand chat"
  ON public.brand_chat_messages FOR SELECT
  TO authenticated
  USING (true);
