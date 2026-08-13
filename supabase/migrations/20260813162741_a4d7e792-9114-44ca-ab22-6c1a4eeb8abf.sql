CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0; v_pot integer; v_prize integer; v_count integer;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.kitchen_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT count(*) INTO v_count FROM public.kitchen_battle_participants WHERE battle_id = v_battle.id;

    IF v_count = 0 THEN
      UPDATE public.kitchen_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    -- Nobody joined: refund the lone participant in full, no winner, no XP
    IF v_count = 1 THEN
      SELECT id, user_id INTO v_winner
      FROM public.kitchen_battle_participants WHERE battle_id = v_battle.id LIMIT 1;
      PERFORM public.battle_coins_apply(v_winner.user_id, 'kitchenstars', 100, 'battle_refund', 'kitchenstars', v_battle.id);
      UPDATE public.kitchen_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      v_settled := v_settled + 1;
      CONTINUE;
    END IF;

    SELECT id, user_id, vote_count INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    v_pot := v_count * 100;
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
DECLARE v_battle record; v_winner record; v_settled integer := 0; v_pot integer; v_prize integer; v_count integer;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.reel_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT count(*) INTO v_count FROM public.reel_battle_participants WHERE battle_id = v_battle.id;

    IF v_count = 0 THEN
      UPDATE public.reel_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    IF v_count = 1 THEN
      SELECT id, user_id INTO v_winner
      FROM public.reel_battle_participants WHERE battle_id = v_battle.id LIMIT 1;
      PERFORM public.battle_coins_apply(v_winner.user_id, 'reel_battles', 100, 'battle_refund', 'reel_battles', v_battle.id);
      UPDATE public.reel_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      v_settled := v_settled + 1;
      CONTINUE;
    END IF;

    SELECT id, user_id, vote_count INTO v_winner
    FROM public.reel_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    v_pot := v_count * 100;
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