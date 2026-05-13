DROP POLICY IF EXISTS "Users can update quantum chat messages" ON public.quantum_chat_messages;

CREATE POLICY "Users can update own quantum chat messages"
ON public.quantum_chat_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);