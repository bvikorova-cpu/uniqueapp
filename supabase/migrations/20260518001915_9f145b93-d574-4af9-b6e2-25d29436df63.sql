DROP POLICY IF EXISTS "Users can send messages" ON public.anonymous_dating_messages;

CREATE POLICY "Users can send messages"
ON public.anonymous_dating_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.anonymous_dating_matches m
    WHERE m.id = anonymous_dating_messages.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND m.status = 'active'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.anonymous_dating_matches m
    JOIN public.blocked_users b
      ON (b.user_id = auth.uid()
          AND b.blocked_user_id = CASE WHEN m.user1_id = auth.uid() THEN m.user2_id ELSE m.user1_id END)
         OR
         (b.blocked_user_id = auth.uid()
          AND b.user_id = CASE WHEN m.user1_id = auth.uid() THEN m.user2_id ELSE m.user1_id END)
    WHERE m.id = anonymous_dating_messages.match_id
  )
);