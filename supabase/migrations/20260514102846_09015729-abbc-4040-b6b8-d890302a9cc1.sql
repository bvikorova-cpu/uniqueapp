REVOKE EXECUTE ON FUNCTION public.get_post_memories(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_post_memories(uuid, int) TO authenticated;