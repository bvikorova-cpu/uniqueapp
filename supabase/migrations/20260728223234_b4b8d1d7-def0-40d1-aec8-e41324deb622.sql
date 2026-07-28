
CREATE OR REPLACE FUNCTION public.award_brain_duel_rp(_user_id uuid, _rp integer, _reason text DEFAULT 'brain_duel')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _points integer;
  _tier text;
BEGIN
  IF _user_id IS NULL OR _rp IS NULL OR _rp = 0 THEN
    RETURN 0;
  END IF;

  INSERT INTO public.brain_duel_rank_avatars (user_id, rank_tier, rank_points)
  VALUES (_user_id, 'bronze', GREATEST(_rp, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET rank_points = GREATEST(public.brain_duel_rank_avatars.rank_points + _rp, 0),
        updated_at = now()
  RETURNING rank_points INTO _points;

  _tier := CASE
    WHEN _points >= 2000 THEN 'grandmaster'
    WHEN _points >= 1000 THEN 'diamond'
    WHEN _points >= 600 THEN 'platinum'
    WHEN _points >= 300 THEN 'gold'
    WHEN _points >= 100 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE public.brain_duel_rank_avatars
     SET rank_tier = _tier, updated_at = now()
   WHERE user_id = _user_id AND rank_tier IS DISTINCT FROM _tier;

  BEGIN
    PERFORM public.award_xp(_user_id, GREATEST(_rp, 0), 'brain_duel', _reason);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN _points;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_brain_duel_rp(uuid, integer, text) TO authenticated, service_role;

-- Small RP for chatting during a duel (capped at 3 messages per match)
CREATE OR REPLACE FUNCTION public.brain_duel_chat_rp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  SELECT count(*) INTO _count
    FROM public.brain_duel_match_chat
   WHERE match_id = NEW.match_id AND sender_id = NEW.sender_id;

  IF _count <= 3 THEN
    PERFORM public.award_brain_duel_rp(NEW.sender_id, 1, 'duel_chat');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_brain_duel_chat_rp ON public.brain_duel_match_chat;
CREATE TRIGGER trg_brain_duel_chat_rp
AFTER INSERT ON public.brain_duel_match_chat
FOR EACH ROW EXECUTE FUNCTION public.brain_duel_chat_rp();
