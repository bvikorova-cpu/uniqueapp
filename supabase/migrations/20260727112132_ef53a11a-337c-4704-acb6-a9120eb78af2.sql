DROP FUNCTION IF EXISTS public.get_secret_santa_active_stories();
CREATE OR REPLACE FUNCTION public.get_secret_santa_active_stories()
RETURNS TABLE(
  id uuid,
  gift_id uuid,
  user_id uuid,
  created_at timestamp with time zone,
  expires_at timestamp with time zone,
  gift_type text,
  gift_emoji text,
  gift_value integer,
  gift_message text,
  gift_created_at timestamp with time zone,
  sender_id uuid,
  sender_name text,
  sender_avatar text,
  is_anonymous boolean,
  recipient_name text,
  recipient_avatar text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    g.created_at AS gift_created_at,
    CASE WHEN g.is_anonymous THEN NULL ELSE g.sender_id END AS sender_id,
    CASE
      WHEN g.is_anonymous THEN 'Anonymous Santa'
      ELSE COALESCE(NULLIF(ps.full_name, ''), NULLIF(ps.username, ''), 'Santa')
    END AS sender_name,
    CASE WHEN g.is_anonymous THEN NULL ELSE ps.avatar_url END AS sender_avatar,
    g.is_anonymous,
    COALESCE(NULLIF(pr.full_name, ''), NULLIF(pr.username, ''), 'Someone') AS recipient_name,
    pr.avatar_url AS recipient_avatar
  FROM public.secret_santa_stories s
  JOIN public.secret_santa_gifts g ON g.id = s.gift_id
  LEFT JOIN public.profiles ps ON ps.id = g.sender_id
  LEFT JOIN public.profiles pr ON pr.id = g.recipient_id
  WHERE s.expires_at > now()
  ORDER BY s.created_at DESC;
$function$;