CREATE OR REPLACE FUNCTION public.touch_messenger_chat_themes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_messenger_chat_themes ON public.messenger_chat_themes;
CREATE TRIGGER trg_touch_messenger_chat_themes
BEFORE UPDATE ON public.messenger_chat_themes
FOR EACH ROW EXECUTE FUNCTION public.touch_messenger_chat_themes();

CREATE OR REPLACE FUNCTION public.get_shared_chat_theme(_peer_ids uuid[])
RETURNS TABLE (
  owner_id uuid,
  theme_id text,
  wallpaper_id text,
  custom_themes jsonb,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.user_id, t.theme_id, t.wallpaper_id, t.custom_themes, t.updated_at
  FROM public.messenger_chat_themes t
  WHERE auth.uid() IS NOT NULL
    AND t.user_id = ANY (ARRAY(SELECT unnest(COALESCE(_peer_ids, '{}'::uuid[])) UNION SELECT auth.uid()))
  ORDER BY t.updated_at DESC NULLS LAST
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_chat_theme(uuid[]) TO authenticated;