-- KitchenStars: entry allowed while waiting for an opponent (no time limit), 7-day voting window starts on 2nd entry
CREATE OR REPLACE FUNCTION public.enter_kitchen_competition(
  _battle_id uuid, _dish_title text, _description text, _video_url text, _media_size bigint, _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.kitchen_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(trim(COALESCE(_dish_title, ''))) < 1 OR length(_dish_title) > 120 THEN RAISE EXCEPTION 'INVALID_DISH_TITLE'; END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' OR COALESCE(_media_mime, '') NOT IN ('video/mp4','video/webm','video/quicktime') THEN
    RAISE EXCEPTION 'VALID_VIDEO_REQUIRED';
  END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  SELECT * INTO v_battle FROM public.kitchen_battles WHERE id = _battle_id FOR UPDATE;
  IF NOT FOUND OR v_battle.status <> 'open' THEN RAISE EXCEPTION 'COMPETITION_NOT_OPEN'; END IF;
  IF EXISTS (SELECT 1 FROM public.kitchen_battle_participants WHERE battle_id = _battle_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count FROM public.kitchen_battle_participants WHERE battle_id = _battle_id;
  IF v_participant_count >= 2 THEN RAISE EXCEPTION 'COMPETITION_FULL'; END IF;
  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST'; END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER'; END IF;

  v_balance_after := public.battle_coins_apply(v_user_id, 'kitchenstars', -100, 'battle_entry', 'kitchenstars', _battle_id);

  INSERT INTO public.kitchen_battle_participants (
    battle_id, user_id, dish_title, description, video_url, media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_dish_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  ) RETURNING id INTO v_participant_id;

  -- voting clock only starts once the duel actually has two chefs
  UPDATE public.kitchen_battles
  SET prize_pool = 200,
      deadline = CASE WHEN v_participant_count = 1 THEN now() + interval '7 days' ELSE deadline END
  WHERE id = _battle_id;

  RETURN jsonb_build_object('success', true, 'participant_id', v_participant_id,
    'coin_balance', v_balance_after, 'entry_cost', 100, 'prize_pool', 200,
    'waiting_for_opponent', v_participant_count = 0);
END; $$;

-- Clip Battles: same rules
CREATE OR REPLACE FUNCTION public.enter_reel_competition(
  _battle_id uuid, _reel_title text, _description text, _video_url text, _media_size bigint, _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.reel_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(trim(COALESCE(_reel_title, ''))) < 1 OR length(_reel_title) > 120 THEN RAISE EXCEPTION 'INVALID_TITLE'; END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' OR COALESCE(_media_mime, '') NOT IN ('video/mp4','video/webm','video/quicktime') THEN
    RAISE EXCEPTION 'VALID_VIDEO_REQUIRED';
  END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  SELECT * INTO v_battle FROM public.reel_battles WHERE id = _battle_id FOR UPDATE;
  IF NOT FOUND OR v_battle.status <> 'open' THEN RAISE EXCEPTION 'COMPETITION_NOT_OPEN'; END IF;
  IF EXISTS (SELECT 1 FROM public.reel_battle_participants WHERE battle_id = _battle_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count FROM public.reel_battle_participants WHERE battle_id = _battle_id;
  IF v_participant_count >= 2 THEN RAISE EXCEPTION 'COMPETITION_FULL'; END IF;
  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST'; END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER'; END IF;

  v_balance_after := public.battle_coins_apply(v_user_id, 'reel_battles', -100, 'battle_entry', 'reel_battles', _battle_id);

  INSERT INTO public.reel_battle_participants (
    battle_id, user_id, reel_title, description, video_url, media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_reel_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  ) RETURNING id INTO v_participant_id;

  UPDATE public.reel_battles
  SET prize_pool = 200,
      deadline = CASE WHEN v_participant_count = 1 THEN now() + interval '7 days' ELSE deadline END
  WHERE id = _battle_id;

  RETURN jsonb_build_object('success', true, 'participant_id', v_participant_id,
    'coin_balance', v_balance_after, 'entry_cost', 100, 'prize_pool', 200,
    'waiting_for_opponent', v_participant_count = 0);
END; $$;

-- Settlement: never close a duel that is still waiting for an opponent, never refund
CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0; v_pot integer; v_prize integer;
BEGIN
  FOR v_battle IN
    SELECT b.id FROM public.kitchen_battles b
    WHERE b.status = 'open' AND b.deadline <= now() AND b.winner_participant_id IS NULL
      AND (SELECT count(*) FROM public.kitchen_battle_participants p WHERE p.battle_id = b.id) >= 2
    ORDER BY b.deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    SELECT count(*) * 100 INTO v_pot FROM public.kitchen_battle_participants WHERE battle_id = v_battle.id;
    v_prize := floor(v_pot * 0.8);

    IF v_prize > 0 THEN
      PERFORM public.battle_coins_apply(v_winner.user_id, 'kitchenstars', v_prize, 'battle_prize', 'kitchenstars', v_battle.id);
    END IF;
    PERFORM public.battle_pool_contribute('kitchenstars', v_pot - v_prize);

    INSERT INTO public.hub_xp (user_id, hub, xp) VALUES (v_winner.user_id, 'kitchenstars', 10)
    ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp) VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.kitchen_battles
    SET status = 'completed', winner_participant_id = v_winner.id, prize_pool = v_prize
    WHERE id = v_battle.id AND winner_participant_id IS NULL;

    IF FOUND THEN v_settled := v_settled + 1; END IF;
  END LOOP;
  RETURN v_settled;
END; $$;

CREATE OR REPLACE FUNCTION public.settle_reel_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0; v_pot integer; v_prize integer;
BEGIN
  FOR v_battle IN
    SELECT b.id FROM public.reel_battles b
    WHERE b.status = 'open' AND b.deadline <= now() AND b.winner_participant_id IS NULL
      AND (SELECT count(*) FROM public.reel_battle_participants p WHERE p.battle_id = b.id) >= 2
    ORDER BY b.deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.reel_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    SELECT count(*) * 100 INTO v_pot FROM public.reel_battle_participants WHERE battle_id = v_battle.id;
    v_prize := floor(v_pot * 0.8);

    IF v_prize > 0 THEN
      PERFORM public.battle_coins_apply(v_winner.user_id, 'reel_battles', v_prize, 'battle_prize', 'reel_battles', v_battle.id);
    END IF;
    PERFORM public.battle_pool_contribute('reel_battles', v_pot - v_prize);

    INSERT INTO public.hub_xp (user_id, hub, xp) VALUES (v_winner.user_id, 'reel_battles', 10)
    ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp) VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.reel_battles
    SET status = 'completed', winner_participant_id = v_winner.id, prize_pool = v_prize
    WHERE id = v_battle.id AND winner_participant_id IS NULL;

    IF FOUND THEN v_settled := v_settled + 1; END IF;
  END LOOP;
  RETURN v_settled;
END; $$;

-- reopen any duel that was auto-closed while still waiting for an opponent
UPDATE public.kitchen_battles b SET status = 'open', deadline = now() + interval '3650 days'
WHERE b.status = 'completed' AND b.winner_participant_id IS NULL
  AND (SELECT count(*) FROM public.kitchen_battle_participants p WHERE p.battle_id = b.id) = 1;

UPDATE public.reel_battles b SET status = 'open', deadline = now() + interval '3650 days'
WHERE b.status = 'completed' AND b.winner_participant_id IS NULL
  AND (SELECT count(*) FROM public.reel_battle_participants p WHERE p.battle_id = b.id) = 1;

REVOKE ALL ON FUNCTION public.settle_kitchen_competitions() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.settle_reel_competitions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_kitchen_competitions() TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_reel_competitions() TO service_role;
GRANT EXECUTE ON FUNCTION public.enter_kitchen_competition(uuid, text, text, text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enter_reel_competition(uuid, text, text, text, bigint, text) TO authenticated;