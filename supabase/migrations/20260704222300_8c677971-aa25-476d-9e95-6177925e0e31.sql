REVOKE EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) TO service_role;