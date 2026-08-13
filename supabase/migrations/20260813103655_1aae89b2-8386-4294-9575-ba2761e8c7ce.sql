
CREATE TABLE public.reel_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  prize_pool NUMERIC NOT NULL DEFAULT 10,
  winner_participant_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reel_battles TO authenticated;
GRANT ALL ON public.reel_battles TO service_role;
ALTER TABLE public.reel_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rb_select_all" ON public.reel_battles FOR SELECT TO authenticated USING (true);
CREATE POLICY "rb_insert_own" ON public.reel_battles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "rb_delete_own_empty" ON public.reel_battles FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.reel_battle_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.reel_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reel_title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  media_type TEXT,
  media_size BIGINT,
  media_mime TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  dislike_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reel_battle_participants TO authenticated;
GRANT ALL ON public.reel_battle_participants TO service_role;
ALTER TABLE public.reel_battle_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbp_select_all" ON public.reel_battle_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "rbp_insert_own" ON public.reel_battle_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reel_battle_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.reel_battles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.reel_battle_participants(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (battle_id, voter_id)
);
GRANT SELECT ON public.reel_battle_votes TO authenticated;
GRANT ALL ON public.reel_battle_votes TO service_role;
ALTER TABLE public.reel_battle_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbv_select_own" ON public.reel_battle_votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);

CREATE TABLE public.reel_battle_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.reel_battles(id) ON DELETE CASCADE,
  participant_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reel_battle_comments TO authenticated;
GRANT ALL ON public.reel_battle_comments TO service_role;
ALTER TABLE public.reel_battle_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rbc_select_all" ON public.reel_battle_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "rbc_insert_own" ON public.reel_battle_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rbc_update_own" ON public.reel_battle_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rbc_delete_own" ON public.reel_battle_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_reel_battle_participants_battle ON public.reel_battle_participants(battle_id);
CREATE INDEX idx_reel_battle_comments_battle ON public.reel_battle_comments(battle_id);

CREATE TRIGGER update_reel_battles_updated_at BEFORE UPDATE ON public.reel_battles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.enter_reel_competition(
  _battle_id uuid, _reel_title text, _description text, _video_url text, _media_size bigint, _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.reel_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_before integer;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(trim(COALESCE(_reel_title, ''))) < 1 OR length(_reel_title) > 120 THEN
    RAISE EXCEPTION 'INVALID_TITLE';
  END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' THEN RAISE EXCEPTION 'VALID_VIDEO_REQUIRED'; END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  SELECT * INTO v_battle FROM public.reel_battles WHERE id = _battle_id FOR UPDATE;
  IF NOT FOUND OR v_battle.status <> 'open' OR v_battle.deadline <= now() THEN
    RAISE EXCEPTION 'COMPETITION_NOT_OPEN';
  END IF;

  IF EXISTS (SELECT 1 FROM public.reel_battle_participants WHERE battle_id = _battle_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count FROM public.reel_battle_participants WHERE battle_id = _battle_id;
  IF v_participant_count >= 2 THEN RAISE EXCEPTION 'COMPETITION_FULL'; END IF;
  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST';
  END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN
    RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER';
  END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining) VALUES (v_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_balance_before FROM public.ai_credits WHERE user_id = v_user_id FOR UPDATE;
  IF COALESCE(v_balance_before, 0) < 5 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  v_balance_after := v_balance_before - 5;
  PERFORM set_config('app.credit_reason', 'reel_battles_competition_entry', true);
  PERFORM set_config('app.credit_source', 'reel_battles', true);

  UPDATE public.ai_credits
  SET credits_remaining = v_balance_after, last_used_at = now(), updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.reel_battle_participants (
    battle_id, user_id, reel_title, description, video_url, media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_reel_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  ) RETURNING id INTO v_participant_id;

  UPDATE public.reel_battles SET prize_pool = 10 WHERE id = _battle_id;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user_id, 'custom_generation', 5, 'reel_battles:competition_entry');

  RETURN jsonb_build_object('success', true, 'participant_id', v_participant_id,
    'balance', v_balance_after, 'entry_cost', 5, 'prize_pool', 10);
END;
$function$;

CREATE OR REPLACE FUNCTION public.settle_reel_competitions()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_battle record; v_winner record; v_settled integer := 0;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.reel_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.reel_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.reel_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    INSERT INTO public.hub_xp (user_id, hub, xp) VALUES (v_winner.user_id, 'reel_battles', 10)
    ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp) VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.reel_battles
    SET status = 'completed', winner_participant_id = v_winner.id, prize_pool = 10
    WHERE id = v_battle.id AND winner_participant_id IS NULL;

    IF FOUND THEN v_settled := v_settled + 1; END IF;
  END LOOP;
  RETURN v_settled;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_reel_battles_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, duels bigint, total_votes bigint, wins bigint, reel_xp integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH stats AS (
    SELECT p.user_id,
      COUNT(DISTINCT p.battle_id) AS duels,
      COALESCE(SUM(p.vote_count), 0)::bigint AS total_votes,
      COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id) AS wins
    FROM public.reel_battle_participants p
    LEFT JOIN public.reel_battles b ON b.id = p.battle_id
    GROUP BY p.user_id
  )
  SELECT s.user_id,
    COALESCE(NULLIF(pr.username, ''), NULLIF(pr.full_name, ''), 'Creator') AS display_name,
    pr.avatar_url, s.duels, s.total_votes, s.wins,
    COALESCE(hx.xp, 0) AS reel_xp
  FROM stats s
  LEFT JOIN public.profiles pr ON pr.id = s.user_id
  LEFT JOIN public.hub_xp hx ON hx.user_id = s.user_id AND hx.hub = 'reel_battles'
  ORDER BY s.wins DESC, s.total_votes DESC, COALESCE(hx.xp, 0) DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$function$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.reel_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reel_battle_participants;

SELECT cron.schedule('settle-reel-competitions', '*/10 * * * *', $$SELECT public.settle_reel_competitions();$$);
