CREATE OR REPLACE FUNCTION public.get_presence_for_users_v1(_user_ids uuid[])
RETURNS TABLE(user_id uuid, is_online boolean, last_seen timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH scoped AS (
    SELECT DISTINCT u AS user_id
    FROM unnest(COALESCE(_user_ids, '{}'::uuid[])) AS u
    WHERE auth.uid() IS NOT NULL
    LIMIT 500
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
  SELECT p.user_id, p.is_online, NULLIF(p.latest_seen, '-infinity'::timestamptz)
  FROM presence p;
$function$;

REVOKE ALL ON FUNCTION public.get_presence_for_users_v1(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_presence_for_users_v1(uuid[]) TO authenticated;