CREATE OR REPLACE FUNCTION public.get_iq_friend_comparison(_friend_id UUID)
RETURNS TABLE (
  user_id UUID, display_name TEXT, avatar_url TEXT, country_code TEXT,
  best_iq INTEGER, avg_iq NUMERIC, total_tests INTEGER, tier TEXT, is_me BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _is_friend BOOLEAN;
BEGIN
  IF _uid IS NULL OR _friend_id IS NULL THEN RETURN; END IF;
  SELECT EXISTS(
    SELECT 1 FROM iq_friendships
    WHERE status = 'accepted'
      AND ((requester_id = _uid AND addressee_id = _friend_id)
        OR (requester_id = _friend_id AND addressee_id = _uid))
  ) INTO _is_friend;
  IF NOT _is_friend THEN RETURN; END IF;
  RETURN QUERY
  SELECT p.user_id, p.display_name, p.avatar_url, s.country_code,
    COALESCE(s.best_iq, 0)::INTEGER, COALESCE(s.avg_iq, 0)::NUMERIC,
    COALESCE(s.total_tests, 0)::INTEGER, COALESCE(s.tier, 'Bronze')::TEXT,
    (p.user_id = _uid)
  FROM iq_public_profiles p
  LEFT JOIN iq_user_stats s ON s.user_id = p.user_id
  WHERE p.user_id IN (_uid, _friend_id);
END; $$;