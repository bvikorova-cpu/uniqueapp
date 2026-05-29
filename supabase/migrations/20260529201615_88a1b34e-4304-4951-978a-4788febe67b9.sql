-- Fix broken SELECT policy on group_chats (self-referencing comparison bug)
-- and allow creators to view their groups (needed for INSERT return=representation)

DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_chats;

CREATE POLICY "Users can view groups they are members of"
ON public.group_chats
FOR SELECT
USING (public.is_group_member(id, auth.uid()) OR auth.uid() = created_by);