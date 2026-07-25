GRANT SELECT, INSERT, DELETE ON public.secret_santa_stories TO authenticated;
GRANT ALL ON public.secret_santa_stories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secret_santa_gifts TO authenticated;
GRANT ALL ON public.secret_santa_gifts TO service_role;

DELETE FROM public.secret_santa_stories a
USING public.secret_santa_stories b
WHERE a.id < b.id
  AND a.gift_id = b.gift_id
  AND a.user_id = b.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_secret_santa_stories_gift_user
ON public.secret_santa_stories(gift_id, user_id);

DROP POLICY IF EXISTS "Users can share their received gifts" ON public.secret_santa_stories;
CREATE POLICY "Users can share only gifts from their inbox"
ON public.secret_santa_stories
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.secret_santa_gifts g
    WHERE g.id = gift_id
      AND g.recipient_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.share_secret_santa_gift_to_story(p_gift_id uuid)
RETURNS public.secret_santa_stories
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_story public.secret_santa_stories;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.secret_santa_gifts g
    WHERE g.id = p_gift_id
      AND g.recipient_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Gift not found in your inbox' USING ERRCODE = '42501';
  END IF;

  UPDATE public.secret_santa_stories
     SET created_at = now(),
         expires_at = now() + interval '24 hours'
   WHERE gift_id = p_gift_id
     AND user_id = v_user_id
   RETURNING * INTO v_story;

  IF v_story.id IS NULL THEN
    INSERT INTO public.secret_santa_stories (gift_id, user_id)
    VALUES (p_gift_id, v_user_id)
    RETURNING * INTO v_story;
  END IF;

  RETURN v_story;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_secret_santa_active_stories()
RETURNS TABLE (
  id uuid,
  gift_id uuid,
  user_id uuid,
  created_at timestamptz,
  expires_at timestamptz,
  gift_type text,
  gift_emoji text,
  gift_value integer,
  gift_message text,
  gift_created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.gift_id,
    s.user_id,
    s.created_at,
    s.expires_at,
    g.gift_type,
    g.gift_emoji,
    g.gift_value,
    g.message AS gift_message,
    g.created_at AS gift_created_at
  FROM public.secret_santa_stories s
  JOIN public.secret_santa_gifts g ON g.id = s.gift_id
  WHERE s.expires_at > now()
  ORDER BY s.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.share_secret_santa_gift_to_story(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secret_santa_active_stories() TO authenticated;
GRANT EXECUTE ON FUNCTION public.share_secret_santa_gift_to_story(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_secret_santa_active_stories() TO service_role;