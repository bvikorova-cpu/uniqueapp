
-- Block direct SELECT/UPDATE of api_key columns from clients (RLS row-level allows
-- owner SELECT *, which would leak api_key; public SELECT for active sponsors
-- would leak everyone's keys). Service role keeps full access for edge fns.
REVOKE SELECT (api_key, api_key_created_at) ON public.brand_sponsors FROM anon, authenticated;
REVOKE UPDATE (api_key, api_key_created_at) ON public.brand_sponsors FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_brand_api_key()
RETURNS TABLE(api_key text, api_key_created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT api_key, api_key_created_at
  FROM public.brand_sponsors
  WHERE user_id = auth.uid()
    AND tier = 'enterprise'
    AND subscription_status = 'active'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.rotate_my_brand_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_key text;
  updated_rows int;
BEGIN
  new_key := 'ba_live_' || replace(gen_random_uuid()::text, '-', '');
  UPDATE public.brand_sponsors
     SET api_key = new_key,
         api_key_created_at = now()
   WHERE user_id = auth.uid()
     AND tier = 'enterprise'
     AND subscription_status = 'active';
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows = 0 THEN
    RAISE EXCEPTION 'no_active_enterprise_sponsor';
  END IF;
  RETURN new_key;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_brand_api_key() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rotate_my_brand_api_key() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_brand_api_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_my_brand_api_key() TO authenticated;
