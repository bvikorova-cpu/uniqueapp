
-- Revert column-level revokes — we now isolate api_key in its own table.
GRANT SELECT (api_key, api_key_created_at) ON public.brand_sponsors TO anon, authenticated;
GRANT UPDATE (api_key, api_key_created_at) ON public.brand_sponsors TO authenticated;

-- Drop the old column-based key (move to dedicated table).
-- Keep columns for backwards compat with webhook code path; but stop using them.
-- We do NOT drop here to avoid breaking in-flight requests; we just stop reading.

-- Private API-key store.
CREATE TABLE IF NOT EXISTS public.brand_sponsor_api_keys (
  sponsor_id uuid PRIMARY KEY REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  api_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- No client access. Only service_role + SECURITY DEFINER functions reach it.
REVOKE ALL ON public.brand_sponsor_api_keys FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.brand_sponsor_api_keys TO service_role;
ALTER TABLE public.brand_sponsor_api_keys ENABLE ROW LEVEL SECURITY;
-- (No policies → no access for anon/authenticated; service_role bypasses RLS.)

-- Migrate any keys already stored on brand_sponsors into the new table.
INSERT INTO public.brand_sponsor_api_keys (sponsor_id, user_id, api_key, created_at)
SELECT id, user_id, api_key, COALESCE(api_key_created_at, now())
FROM public.brand_sponsors
WHERE api_key IS NOT NULL
ON CONFLICT (sponsor_id) DO NOTHING;

-- Replace earlier owner-facing helpers to read from the new table.
CREATE OR REPLACE FUNCTION public.get_my_brand_api_key()
RETURNS TABLE(api_key text, api_key_created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.api_key, k.created_at AS api_key_created_at
  FROM public.brand_sponsor_api_keys k
  JOIN public.brand_sponsors s ON s.id = k.sponsor_id
  WHERE s.user_id = auth.uid()
    AND s.tier = 'enterprise'
    AND s.subscription_status = 'active'
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
  sid uuid;
  uid uuid := auth.uid();
BEGIN
  SELECT id INTO sid FROM public.brand_sponsors
  WHERE user_id = uid AND tier = 'enterprise' AND subscription_status = 'active'
  LIMIT 1;
  IF sid IS NULL THEN
    RAISE EXCEPTION 'no_active_enterprise_sponsor';
  END IF;
  new_key := 'ba_live_' || replace(gen_random_uuid()::text, '-', '');
  INSERT INTO public.brand_sponsor_api_keys (sponsor_id, user_id, api_key, created_at)
  VALUES (sid, uid, new_key, now())
  ON CONFLICT (sponsor_id) DO UPDATE
    SET api_key = EXCLUDED.api_key, created_at = now();
  RETURN new_key;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_brand_api_key() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rotate_my_brand_api_key() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_brand_api_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_my_brand_api_key() TO authenticated;

-- Drop the old api_key columns from brand_sponsors entirely (no longer used).
ALTER TABLE public.brand_sponsors DROP COLUMN IF EXISTS api_key;
ALTER TABLE public.brand_sponsors DROP COLUMN IF EXISTS api_key_created_at;
