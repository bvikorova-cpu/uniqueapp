CREATE OR REPLACE FUNCTION public.get_users_who_close_friended_me()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.user_close_friends WHERE friend_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_users_who_close_friended_me() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_users_who_close_friended_me() TO authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS user_muted_keywords_user_keyword_uidx
  ON public.user_muted_keywords (user_id, lower(keyword));