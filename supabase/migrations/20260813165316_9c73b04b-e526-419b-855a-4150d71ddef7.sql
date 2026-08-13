CREATE TABLE public.battle_matchmaking_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  module text NOT NULL CHECK (module IN ('kitchenstars','reel_battles','megatalent')),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  media_size bigint,
  media_mime text,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','matched','cancelled')),
  battle_id uuid,
  matched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.battle_matchmaking_queue TO authenticated;
GRANT ALL ON public.battle_matchmaking_queue TO service_role;

ALTER TABLE public.battle_matchmaking_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own queue entries"
ON public.battle_matchmaking_queue FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE UNIQUE INDEX idx_battle_queue_one_waiting
  ON public.battle_matchmaking_queue (user_id, module)
  WHERE status = 'waiting';

CREATE INDEX idx_battle_queue_waiting_module
  ON public.battle_matchmaking_queue (module, created_at)
  WHERE status = 'waiting';

CREATE TRIGGER trg_battle_queue_updated_at
BEFORE UPDATE ON public.battle_matchmaking_queue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.join_battle_queue(
  _module text,
  _title text,
  _description text,
  _video_url text,
  _media_size bigint,
  _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_opp public.battle_matchmaking_queue%ROWTYPE;
  v_queue_id uuid;
  v_battle_id uuid;
  v_balance_after integer;
  v_waiting integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _module NOT IN ('kitchenstars','reel_battles') THEN RAISE EXCEPTION 'MODULE_NOT_SUPPORTED'; END IF;
  IF length(trim(COALESCE(_title, ''))) < 1 OR length(_title) > 120 THEN RAISE EXCEPTION 'INVALID_TITLE'; END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' THEN RAISE EXCEPTION 'VALID_VIDEO_REQUIRED'; END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.battle_matchmaking_queue
    WHERE user_id = v_user_id AND module = _module AND status = 'waiting'
  ) THEN
    RAISE EXCEPTION 'ALREADY_IN_QUEUE';
  END IF;

  -- Entry fee is charged up front from this module's own wallet.
  v_balance_after := public.battle_coins_apply(v_user_id, _module, -100, 'battle_entry', _module, NULL);

  INSERT INTO public.battle_matchmaking_queue (
    user_id, module, title, description, video_url, media_size, media_mime
  ) VALUES (
    v_user_id, _module, trim(_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, _media_size, _media_mime
  ) RETURNING id INTO v_queue_id;

  -- Pick a RANDOM waiting opponent in the same module and lock it.
  SELECT * INTO v_opp
  FROM public.battle_matchmaking_queue
  WHERE module = _module AND status = 'waiting' AND user_id <> v_user_id
  ORDER BY random()
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT count(*) INTO v_waiting FROM public.battle_matchmaking_queue
    WHERE module = _module AND status = 'waiting';
    RETURN jsonb_build_object(
      'success', true, 'matched', false, 'queue_id', v_queue_id,
      'waiting_count', v_waiting, 'coin_balance', v_balance_after, 'entry_cost', 100
    );
  END IF;

  IF _module = 'kitchenstars' THEN
    INSERT INTO public.kitchen_battles (theme, description, created_by, prize_pool, deadline)
    VALUES (v_opp.title || ' vs ' || trim(_title), NULL, v_opp.user_id, 200, now() + interval '7 days')
    RETURNING id INTO v_battle_id;

    INSERT INTO public.kitchen_battle_participants
      (battle_id, user_id, dish_title, description, video_url, media_type, media_size, media_mime)
    VALUES
      (v_battle_id, v_opp.user_id, v_opp.title, v_opp.description, v_opp.video_url, 'video', v_opp.media_size, v_opp.media_mime),
      (v_battle_id, v_user_id, trim(_title), NULLIF(trim(COALESCE(_description, '')), ''), _video_url, 'video', _media_size, _media_mime);
  ELSE
    INSERT INTO public.reel_battles (theme, description, created_by, prize_pool, deadline)
    VALUES (v_opp.title || ' vs ' || trim(_title), NULL, v_opp.user_id, 200, now() + interval '7 days')
    RETURNING id INTO v_battle_id;

    INSERT INTO public.reel_battle_participants
      (battle_id, user_id, reel_title, description, video_url, media_type, media_size, media_mime)
    VALUES
      (v_battle_id, v_opp.user_id, v_opp.title, v_opp.description, v_opp.video_url, 'video', v_opp.media_size, v_opp.media_mime),
      (v_battle_id, v_user_id, trim(_title), NULLIF(trim(COALESCE(_description, '')), ''), _video_url, 'video', _media_size, _media_mime);
  END IF;

  UPDATE public.battle_matchmaking_queue
  SET status = 'matched', battle_id = v_battle_id, matched_at = now()
  WHERE id IN (v_queue_id, v_opp.id);

  BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      v_opp.user_id, 'battle_matched', 'Your duel has started!',
      'An opponent joined your clip — voting is now open for 7 days.',
      CASE WHEN _module = 'kitchenstars' THEN '/kitchenstars-battles?c=' ELSE '/clip-battles?c=' END || v_battle_id
    );
  EXCEPTION WHEN others THEN NULL;
  END;

  RETURN jsonb_build_object(
    'success', true, 'matched', true, 'battle_id', v_battle_id,
    'queue_id', v_queue_id, 'coin_balance', v_balance_after, 'entry_cost', 100, 'prize_pool', 200
  );
END; $function$;

CREATE OR REPLACE FUNCTION public.leave_battle_queue(_module text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_row public.battle_matchmaking_queue%ROWTYPE;
  v_balance_after integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT * INTO v_row FROM public.battle_matchmaking_queue
  WHERE user_id = v_user_id AND module = _module AND status = 'waiting'
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_IN_QUEUE'; END IF;

  UPDATE public.battle_matchmaking_queue SET status = 'cancelled' WHERE id = v_row.id;

  -- Full refund of the entry fee back into the same module wallet.
  v_balance_after := public.battle_coins_apply(v_user_id, _module, 100, 'battle_entry_refund', _module, NULL);

  RETURN jsonb_build_object('success', true, 'refunded', 100, 'coin_balance', v_balance_after);
END; $function$;

CREATE OR REPLACE FUNCTION public.get_battle_queue_status(_module text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_mine public.battle_matchmaking_queue%ROWTYPE;
  v_waiting integer;
BEGIN
  SELECT count(*) INTO v_waiting FROM public.battle_matchmaking_queue
  WHERE module = _module AND status = 'waiting';

  IF v_user_id IS NOT NULL THEN
    SELECT * INTO v_mine FROM public.battle_matchmaking_queue
    WHERE user_id = v_user_id AND module = _module AND status = 'waiting'
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'waiting_count', v_waiting,
    'in_queue', v_mine.id IS NOT NULL,
    'my_title', v_mine.title,
    'since', v_mine.created_at
  );
END; $function$;

GRANT EXECUTE ON FUNCTION public.join_battle_queue(text, text, text, text, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_battle_queue(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_battle_queue_status(text) TO authenticated;