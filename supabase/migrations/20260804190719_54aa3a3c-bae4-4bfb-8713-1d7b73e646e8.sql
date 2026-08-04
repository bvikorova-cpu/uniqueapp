REVOKE ALL ON FUNCTION public.toggle_time_reversal_like(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_time_reversal_like(uuid) TO authenticated;