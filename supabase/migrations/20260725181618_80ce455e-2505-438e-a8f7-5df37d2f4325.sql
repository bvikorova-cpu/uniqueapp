REVOKE EXECUTE ON FUNCTION public.get_my_secret_santa_received_gifts() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_secret_santa_sent_gifts() FROM anon;
REVOKE ALL ON FUNCTION public.get_my_secret_santa_received_gifts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_secret_santa_sent_gifts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_secret_santa_received_gifts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_secret_santa_sent_gifts() TO authenticated;