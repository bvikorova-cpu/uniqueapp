CREATE OR REPLACE FUNCTION public.enforce_influking_no_adult()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.is_adult := false;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_influking_no_adult_trigger ON public.influencer_profiles;
CREATE TRIGGER enforce_influking_no_adult_trigger
BEFORE INSERT OR UPDATE OF is_adult ON public.influencer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_influking_no_adult();

CREATE OR REPLACE FUNCTION public.unlock_adult_creator(_influencer_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object('ok', false, 'error', 'adult_content_disabled');
$$;

REVOKE ALL ON FUNCTION public.unlock_adult_creator(uuid) FROM public;
REVOKE ALL ON FUNCTION public.unlock_adult_creator(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.unlock_adult_creator(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_adult_creator(uuid) TO service_role;