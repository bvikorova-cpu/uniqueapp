-- Create optimized auth helper function to reduce RLS initialization overhead
-- This function caches auth.uid() result and is marked STABLE for query optimization

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  )
$$;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_id() TO service_role;

-- Add comment explaining the function
COMMENT ON FUNCTION public.get_current_user_id() IS 'Optimized function to get current user ID, reduces RLS initialization overhead by caching auth.uid() result';