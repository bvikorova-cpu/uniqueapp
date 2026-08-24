REVOKE ALL ON FUNCTION public.has_active_megatalent_subscription(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_active_megatalent_subscription(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_active_megatalent_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_megatalent_subscription(uuid) TO service_role;