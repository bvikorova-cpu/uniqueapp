
-- 1) Extend conversation_messages with rich fields
ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_duration INT,
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.conversation_messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) get_or_create_dm_conversation(other_user)
CREATE OR REPLACE FUNCTION public.get_or_create_dm_conversation(_other_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _conv uuid;
BEGIN
  IF _me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _other_user IS NULL OR _other_user = _me THEN
    RAISE EXCEPTION 'Invalid counterpart';
  END IF;

  -- Find existing 1:1 conversation that contains exactly these two users
  SELECT c.id INTO _conv
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (SELECT 1 FROM public.conversation_participants p
                WHERE p.conversation_id = c.id AND p.user_id = _me)
    AND EXISTS (SELECT 1 FROM public.conversation_participants p
                WHERE p.conversation_id = c.id AND p.user_id = _other_user)
    AND (SELECT COUNT(*) FROM public.conversation_participants p
         WHERE p.conversation_id = c.id) = 2
  LIMIT 1;

  IF _conv IS NOT NULL THEN
    RETURN _conv;
  END IF;

  INSERT INTO public.conversations (is_group, created_by)
  VALUES (false, _me)
  RETURNING id INTO _conv;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (_conv, _me), (_conv, _other_user);

  RETURN _conv;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_dm_conversation(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm_conversation(uuid) TO authenticated;
