-- Create helper function to check phobia service access
CREATE OR REPLACE FUNCTION public.has_phobia_access(
  user_id_param UUID,
  service_type_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.phobia_purchases
    WHERE user_id = user_id_param
    AND service_type = service_type_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;