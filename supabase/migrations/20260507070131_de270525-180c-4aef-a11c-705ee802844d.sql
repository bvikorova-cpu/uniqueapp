
-- Cleanup test emotion posts
DELETE FROM public.emotion_posts WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');

-- Quantum likes trigger to maintain likes_count
CREATE OR REPLACE FUNCTION public.update_quantum_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.quantum_posts SET likes_count = COALESCE(likes_count,0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.quantum_posts SET likes_count = GREATEST(COALESCE(likes_count,0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_quantum_likes_count ON public.quantum_likes;
CREATE TRIGGER trg_quantum_likes_count
AFTER INSERT OR DELETE ON public.quantum_likes
FOR EACH ROW EXECUTE FUNCTION public.update_quantum_post_likes_count();

-- Allow users to update messages they observe (collapse state) - permissive for chat participants
DROP POLICY IF EXISTS "Users can update quantum chat messages" ON public.quantum_chat_messages;
CREATE POLICY "Users can update quantum chat messages"
ON public.quantum_chat_messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
