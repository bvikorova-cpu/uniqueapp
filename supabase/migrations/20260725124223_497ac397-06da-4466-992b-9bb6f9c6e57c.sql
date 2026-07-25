REVOKE ALL ON FUNCTION public.share_secret_santa_gift_to_story(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_secret_santa_active_stories() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.share_secret_santa_gift_to_story(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_secret_santa_active_stories() FROM anon;

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
    NULL::text AS gift_message,
    g.created_at AS gift_created_at
  FROM public.secret_santa_stories s
  JOIN public.secret_santa_gifts g ON g.id = s.gift_id
  WHERE s.expires_at > now()
  ORDER BY s.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_secret_santa_active_stories() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_secret_santa_active_stories() FROM anon;
GRANT EXECUTE ON FUNCTION public.share_secret_santa_gift_to_story(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secret_santa_active_stories() TO authenticated;
GRANT EXECUTE ON FUNCTION public.share_secret_santa_gift_to_story(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_secret_santa_active_stories() TO service_role;