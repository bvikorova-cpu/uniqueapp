CREATE OR REPLACE FUNCTION public.accept_iq_friend(_friendship_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _ok INT;
BEGIN
  IF _uid IS NULL THEN RETURN FALSE; END IF;
  UPDATE public.iq_friendships
     SET status = 'accepted', updated_at = now()
   WHERE id = _friendship_id AND addressee_id = _uid AND status = 'pending';
  GET DIAGNOSTICS _ok = ROW_COUNT;
  RETURN _ok > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_iq_friend(UUID) TO authenticated;
