-- Restore EXECUTE grants on RLS helper functions that were getting "permission denied"
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_lottery_syndicate_member(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_creative_room_member(uuid, uuid) TO anon, authenticated;