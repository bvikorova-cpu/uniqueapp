CREATE OR REPLACE FUNCTION public.get_my_conversation_presence_v1(_user_ids uuid[] DEFAULT NULL)
RETURNS TABLE(user_id uuid, is_online boolean, last_seen timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH partner_ids AS (
    SELECT DISTINCT cp_other.user_id
    FROM public.conversation_participants cp_self
    JOIN public.conversation_participants cp_other
      ON cp_other.conversation_id = cp_self.conversation_id
     AND cp_other.user_id <> auth.uid()
    WHERE cp_self.user_id = auth.uid()
  ),
  scoped AS (
    SELECT p.user_id
    FROM partner_ids p
    WHERE _user_ids IS NULL OR p.user_id = ANY(_user_ids)
  ),
  presence AS (
    SELECT
      s.user_id,
      COALESCE(uos.is_online, false)
        AND COALESCE(uos.last_seen, '-infinity'::timestamptz) >= now() - interval '2 minutes'
        AS is_online,
      GREATEST(
        COALESCE(uos.last_seen, '-infinity'::timestamptz),
        COALESCE(ua.last_seen, '-infinity'::timestamptz),
        COALESCE(au.last_sign_in_at, '-infinity'::timestamptz),
        COALESCE(au.updated_at, '-infinity'::timestamptz)
      ) AS latest_seen
    FROM scoped s
    LEFT JOIN public.user_online_status uos ON uos.user_id = s.user_id
    LEFT JOIN public.user_activity ua ON ua.user_id = s.user_id
    LEFT JOIN auth.users au ON au.id = s.user_id
  )
  SELECT
    p.user_id,
    p.is_online,
    NULLIF(p.latest_seen, '-infinity'::timestamptz) AS last_seen
  FROM presence p;
$$;

REVOKE ALL ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_presence_v1(uuid[]) TO service_role;