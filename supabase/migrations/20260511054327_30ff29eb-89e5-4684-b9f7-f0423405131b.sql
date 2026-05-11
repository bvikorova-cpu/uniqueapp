-- Friend challenge invite columns on iq_duels
ALTER TABLE public.iq_duels
  ADD COLUMN IF NOT EXISTS invite_code TEXT,
  ADD COLUMN IF NOT EXISTS is_friend_challenge BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_iq_duels_invite_code ON public.iq_duels(invite_code) WHERE invite_code IS NOT NULL;

DROP POLICY IF EXISTS "View by invite code" ON public.iq_duels;
CREATE POLICY "View by invite code" ON public.iq_duels
  FOR SELECT USING (invite_code IS NOT NULL AND status = 'waiting');

CREATE OR REPLACE FUNCTION public.create_iq_friend_challenge(_mode text)
RETURNS TABLE(duel_id uuid, invite_code text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _uid uuid := auth.uid();
  _code text;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  IF _mode NOT IN ('quick','standard','ranked','blitz') THEN RAISE EXCEPTION 'invalid_mode'; END IF;
  _code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
  INSERT INTO iq_duels(mode, host_id, status, is_friend_challenge, invite_code)
  VALUES (_mode, _uid, 'waiting', true, _code)
  RETURNING id INTO _id;
  RETURN QUERY SELECT _id, _code;
END;$$;

CREATE OR REPLACE FUNCTION public.accept_iq_friend_challenge(_code text)
RETURNS TABLE(duel_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  _uid uuid := auth.uid();
  _duel iq_duels%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauthorized'; END IF;
  SELECT * INTO _duel FROM iq_duels WHERE invite_code = upper(_code) AND status = 'waiting';
  IF NOT FOUND THEN RAISE EXCEPTION 'invite_not_found_or_expired'; END IF;
  IF _duel.host_id = _uid THEN RAISE EXCEPTION 'cannot_accept_own_challenge'; END IF;
  UPDATE iq_duels SET opponent_id = _uid, status = 'active', started_at = now()
    WHERE id = _duel.id;
  RETURN QUERY SELECT _duel.id;
END;$$;

CREATE OR REPLACE FUNCTION public.get_iq_countries_with_players()
RETURNS TABLE(country_code text, player_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT country_code, COUNT(*)::bigint
  FROM iq_user_stats
  WHERE country_code IS NOT NULL AND best_iq > 0
  GROUP BY country_code
  ORDER BY COUNT(*) DESC
  LIMIT 50;
$$;