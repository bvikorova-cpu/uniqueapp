
-- 1) Lock down stream_key column on megatalent_live_streams
REVOKE SELECT ON public.megatalent_live_streams FROM anon, authenticated;

-- Re-grant SELECT on all columns EXCEPT stream_key
GRANT SELECT (
  id, host_user_id, category, title, description, status,
  scheduled_at, started_at, ended_at, viewer_count,
  created_at, updated_at
) ON public.megatalent_live_streams TO anon, authenticated;

-- Keep write privileges for authenticated (RLS still enforces host_user_id = auth.uid())
GRANT INSERT, UPDATE, DELETE ON public.megatalent_live_streams TO authenticated;

-- Service role retains full access
GRANT ALL ON public.megatalent_live_streams TO service_role;

-- Security definer helper so the host can fetch its own stream_key
CREATE OR REPLACE FUNCTION public.get_megatalent_stream_key(_stream_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT stream_key
  FROM public.megatalent_live_streams
  WHERE id = _stream_id
    AND host_user_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.get_megatalent_stream_key(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_megatalent_stream_key(uuid) TO authenticated;

-- 2) public_profiles view — enforce caller's RLS, not the view owner's
ALTER VIEW public.public_profiles SET (security_invoker = on);
