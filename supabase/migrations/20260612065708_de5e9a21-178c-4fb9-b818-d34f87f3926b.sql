
-- Consolidate & tighten RLS on dating_matches and dating_messages

-- dating_matches: remove duplicate SELECT
DROP POLICY IF EXISTS "Users can view own matches" ON public.dating_matches;
DROP POLICY IF EXISTS "Users can view their matches" ON public.dating_matches;

CREATE POLICY "dm_select_own"
ON public.dating_matches
FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- dating_messages: remove duplicates + overly broad UPDATE
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can insert messages in their matches" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.dating_messages;

CREATE POLICY "dmsg_select_participants"
ON public.dating_messages
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.dating_matches m
  WHERE m.id = dating_messages.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
));

CREATE POLICY "dmsg_insert_sender"
ON public.dating_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.dating_matches m
    WHERE m.id = dating_messages.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Sender may edit their own message content; recipient may NOT edit content.
-- Read status is updated server-side via SECURITY DEFINER RPC if needed.
CREATE POLICY "dmsg_update_sender_only"
ON public.dating_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);
