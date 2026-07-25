CREATE OR REPLACE FUNCTION public.get_my_secret_santa_received_gifts()
RETURNS SETOF public.secret_santa_gifts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT g.*
  FROM public.secret_santa_gifts g
  WHERE g.recipient_id = auth.uid()
     OR EXISTS (
       SELECT 1
       FROM public.profiles p
       WHERE p.id = g.recipient_id
         AND lower(coalesce(p.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
         AND coalesce(auth.jwt() ->> 'email', '') <> ''
     )
  ORDER BY g.created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_secret_santa_sent_gifts()
RETURNS SETOF public.secret_santa_gifts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT g.*
  FROM public.secret_santa_gifts g
  WHERE g.sender_id = auth.uid()
     OR EXISTS (
       SELECT 1
       FROM public.profiles p
       WHERE p.id = g.sender_id
         AND lower(coalesce(p.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
         AND coalesce(auth.jwt() ->> 'email', '') <> ''
     )
  ORDER BY g.created_at DESC;
$function$;

REVOKE ALL ON FUNCTION public.get_my_secret_santa_received_gifts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_secret_santa_sent_gifts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_secret_santa_received_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_secret_santa_sent_gifts() TO authenticated;