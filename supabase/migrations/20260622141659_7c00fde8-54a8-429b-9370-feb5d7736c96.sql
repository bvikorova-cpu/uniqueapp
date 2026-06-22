GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.founding_members_remaining() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_view_post(uuid, uuid, text) TO authenticated, anon;