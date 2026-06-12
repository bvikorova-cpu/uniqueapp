
DROP POLICY IF EXISTS "dmsg_insert_sender" ON public.dating_messages;
CREATE POLICY "dmsg_insert_sender" ON public.dating_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.dating_matches m
      WHERE m.id = dating_messages.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create their own matches" ON public.dating_matches;
CREATE POLICY "dm_insert_participant" ON public.dating_matches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.anonymous_dating_messages;
CREATE POLICY "adm_insert_sender" ON public.anonymous_dating_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.anonymous_dating_matches m
      WHERE m.id = anonymous_dating_messages.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can follow other users" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow other users" ON public.follows;
DROP POLICY IF EXISTS "Anyone can view all follows" ON public.follows;

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);
