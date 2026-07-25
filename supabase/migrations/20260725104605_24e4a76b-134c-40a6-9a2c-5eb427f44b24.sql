
ALTER TABLE public.secret_santa_challenge_progress
  ADD COLUMN IF NOT EXISTS window_start timestamptz DEFAULT now();

CREATE OR REPLACE FUNCTION public.recompute_santa_challenge_progress(_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE
  ch RECORD;
  ws timestamptz;
  cnt int;
BEGIN
  IF _user IS NULL THEN RETURN; END IF;
  FOR ch IN SELECT * FROM public.secret_santa_challenges WHERE is_active LOOP
    IF ch.challenge_type = 'daily' THEN ws := date_trunc('day', now());
    ELSIF ch.challenge_type = 'weekly' THEN ws := date_trunc('week', now());
    ELSE ws := 'epoch'::timestamptz; END IF;

    IF ch.title IN ('Daily Gifter','Generous Soul','Weekly Champion') THEN
      SELECT COUNT(*) INTO cnt FROM public.secret_santa_gifts
        WHERE sender_id=_user AND created_at >= ws;
    ELSIF ch.title = 'Big Spender' THEN
      SELECT COUNT(*) INTO cnt FROM public.secret_santa_gifts
        WHERE sender_id=_user AND created_at >= ws AND gift_value >= 50;
    ELSIF ch.title = 'Social Butterfly' THEN
      SELECT COUNT(DISTINCT recipient_id) INTO cnt FROM public.secret_santa_gifts
        WHERE sender_id=_user AND created_at >= ws;
    ELSIF ch.title = 'Category Explorer' THEN
      SELECT COUNT(DISTINCT gift_type) INTO cnt FROM public.secret_santa_gifts
        WHERE sender_id=_user AND created_at >= ws;
    ELSIF ch.title = 'Streak Builder' THEN
      SELECT COUNT(DISTINCT date_trunc('day', created_at)) INTO cnt FROM public.secret_santa_gifts
        WHERE sender_id=_user AND created_at >= ws;
    ELSE
      cnt := 0;
    END IF;

    INSERT INTO public.secret_santa_challenge_progress
      (user_id, challenge_id, current_count, is_completed, reward_claimed, completed_at, window_start)
    VALUES
      (_user, ch.id, cnt, cnt >= ch.target_count, false,
       CASE WHEN cnt >= ch.target_count THEN now() END, ws)
    ON CONFLICT (user_id, challenge_id) DO UPDATE SET
      current_count = EXCLUDED.current_count,
      is_completed  = EXCLUDED.is_completed,
      window_start  = EXCLUDED.window_start,
      completed_at  = CASE
        WHEN EXCLUDED.is_completed AND NOT public.secret_santa_challenge_progress.is_completed THEN now()
        WHEN public.secret_santa_challenge_progress.window_start < EXCLUDED.window_start THEN EXCLUDED.completed_at
        ELSE public.secret_santa_challenge_progress.completed_at
      END,
      reward_claimed = CASE
        WHEN public.secret_santa_challenge_progress.window_start < EXCLUDED.window_start THEN false
        ELSE public.secret_santa_challenge_progress.reward_claimed
      END;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.trg_santa_challenge_after_gift()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
BEGIN
  PERFORM public.recompute_santa_challenge_progress(NEW.sender_id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_santa_challenge_after_gift ON public.secret_santa_gifts;
CREATE TRIGGER trg_santa_challenge_after_gift
  AFTER INSERT ON public.secret_santa_gifts
  FOR EACH ROW EXECUTE FUNCTION public.trg_santa_challenge_after_gift();

-- Claim reward RPC → pays into unified ai_credits ledger.
CREATE OR REPLACE FUNCTION public.claim_santa_challenge_reward(p_challenge_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_ch   RECORD;
  v_pg   RECORD;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO v_ch FROM public.secret_santa_challenges WHERE id = p_challenge_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Challenge not found'; END IF;

  PERFORM public.recompute_santa_challenge_progress(v_user);

  SELECT * INTO v_pg FROM public.secret_santa_challenge_progress
    WHERE user_id = v_user AND challenge_id = p_challenge_id;
  IF NOT FOUND OR NOT v_pg.is_completed THEN
    RAISE EXCEPTION 'Challenge not completed';
  END IF;
  IF v_pg.reward_claimed THEN
    RAISE EXCEPTION 'Reward already claimed';
  END IF;

  UPDATE public.secret_santa_challenge_progress
     SET reward_claimed = true
   WHERE user_id = v_user AND challenge_id = p_challenge_id;

  PERFORM public.add_ai_credits(v_user, v_ch.reward_credits, 'santa_challenge_reward', 'rpc');

  RETURN jsonb_build_object('ok', true, 'credits_awarded', v_ch.reward_credits);
END $$;

GRANT EXECUTE ON FUNCTION public.claim_santa_challenge_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_santa_challenge_progress(uuid) TO authenticated;
