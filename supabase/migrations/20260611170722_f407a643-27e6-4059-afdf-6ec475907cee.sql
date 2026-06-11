CREATE OR REPLACE FUNCTION public.increment_ai_gallery_likes(
  p_item_id uuid,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_delta NOT IN (1, -1) THEN
    RAISE EXCEPTION 'delta must be +1 or -1';
  END IF;
  UPDATE public.ai_community_gallery
     SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + p_delta)
   WHERE id = p_item_id
  RETURNING likes_count INTO new_count;
  RETURN new_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_ai_gallery_likes(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_emotion_post_likes(
  p_post_id uuid,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_delta NOT IN (1, -1) THEN
    RAISE EXCEPTION 'delta must be +1 or -1';
  END IF;
  UPDATE public.emotion_posts
     SET likes_count = GREATEST(0, COALESCE(likes_count, 0) + p_delta)
   WHERE id = p_post_id
  RETURNING likes_count INTO new_count;
  RETURN new_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_emotion_post_likes(uuid, integer) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'dating_matches'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.dating_matches';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages';
  END IF;
END $$;

ALTER TABLE public.dating_matches REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_messages REPLICA IDENTITY FULL;