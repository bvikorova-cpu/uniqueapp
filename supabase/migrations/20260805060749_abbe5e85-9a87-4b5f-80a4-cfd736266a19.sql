CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.current_user_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

CREATE POLICY "Recipients can view delivered capsules sent to them"
ON public.time_capsules
FOR SELECT
TO authenticated
USING (
  is_delivered = true
  AND recipient_email IS NOT NULL
  AND lower(recipient_email) = lower(public.current_user_email())
);