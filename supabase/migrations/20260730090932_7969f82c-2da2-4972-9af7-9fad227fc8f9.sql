CREATE OR REPLACE FUNCTION public.increment_clone_conversations(p_clone_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.personality_clones
     SET total_conversations = COALESCE(total_conversations, 0) + 1
   WHERE id = p_clone_id;
$$;

REVOKE ALL ON FUNCTION public.increment_clone_conversations(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_clone_conversations(uuid) TO service_role;

UPDATE public.personality_clones pc
   SET total_conversations = sub.cnt
  FROM (
    SELECT clone_id, COUNT(DISTINCT user_id) AS cnt
      FROM public.clone_chat_messages
     GROUP BY clone_id
  ) sub
 WHERE pc.id = sub.clone_id
   AND COALESCE(pc.total_conversations, 0) <> sub.cnt;