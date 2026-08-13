-- ============ PRIZE POOLS (percentage model, like Megatalent) ============
CREATE TABLE IF NOT EXISTS public.battle_prize_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL CHECK (module IN ('kitchenstars','reel_battles')),
  period_month date NOT NULL,
  pool_coins integer NOT NULL DEFAULT 0 CHECK (pool_coins >= 0),
  duels_counted integer NOT NULL DEFAULT 0,
  distributed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module, period_month)
);
GRANT SELECT ON public.battle_prize_pools TO authenticated;
GRANT SELECT ON public.battle_prize_pools TO anon;
GRANT ALL ON public.battle_prize_pools TO service_role;
ALTER TABLE public.battle_prize_pools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prize pools public read" ON public.battle_prize_pools;
CREATE POLICY "prize pools public read" ON public.battle_prize_pools FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.battle_prize_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL CHECK (module IN ('kitchenstars','reel_battles')),
  period_month date NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 5),
  user_id uuid NOT NULL,
  percent numeric NOT NULL,
  coins integer NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module, period_month, rank)
);
GRANT SELECT ON public.battle_prize_payouts TO authenticated;
GRANT SELECT ON public.battle_prize_payouts TO anon;
GRANT ALL ON public.battle_prize_payouts TO service_role;
ALTER TABLE public.battle_prize_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prize payouts public read" ON public.battle_prize_payouts;
CREATE POLICY "prize payouts public read" ON public.battle_prize_payouts FOR SELECT USING (true);

CREATE TRIGGER trg_battle_prize_pools_updated_at
BEFORE UPDATE ON public.battle_prize_pools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- helper: add coins to current month pool
CREATE OR REPLACE FUNCTION public.battle_pool_contribute(_module text, _coins integer)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF COALESCE(_coins, 0) <= 0 THEN RETURN; END IF;
  INSERT INTO public.battle_prize_pools (module, period_month, pool_coins, duels_counted)
  VALUES (_module, date_trunc('month', now())::date, _coins, 1)
  ON CONFLICT (module, period_month) DO UPDATE
    SET pool_coins = public.battle_prize_pools.pool_coins + EXCLUDED.pool_coins,
        duels_counted = public.battle_prize_pools.duels_counted + 1,
        updated_at = now();
END; $$;
REVOKE ALL ON FUNCTION public.battle_pool_contribute(text, integer) FROM PUBLIC;

-- live pool + projected percentage split
CREATE OR REPLACE FUNCTION public.get_battle_prize_pool(_module text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_pool public.battle_prize_pools%ROWTYPE;
  v_percents numeric[] := ARRAY[40,25,15,10,10];
BEGIN
  SELECT * INTO v_pool FROM public.battle_prize_pools
  WHERE module = _module AND period_month = date_trunc('month', now())::date;

  RETURN jsonb_build_object(
    'module', _module,
    'period_month', date_trunc('month', now())::date,
    'pool_coins', COALESCE(v_pool.pool_coins, 0),
    'duels_counted', COALESCE(v_pool.duels_counted, 0),
    'winner_share_percent', 80,
    'pool_share_percent', 20,
    'splits', (
      SELECT jsonb_agg(jsonb_build_object(
        'rank', i,
        'percent', v_percents[i],
        'coins', floor(COALESCE(v_pool.pool_coins, 0) * v_percents[i] / 100.0)
      ) ORDER BY i)
      FROM generate_series(1, 5) AS i
    )
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.get_battle_prize_pool(text) TO authenticated, anon;

-- monthly distribution: TOP 5 of the module leaderboard get 40/25/15/10/10 %
CREATE OR REPLACE FUNCTION public.distribute_battle_prize_pools()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_module text;
  v_pool public.battle_prize_pools%ROWTYPE;
  v_percents numeric[] := ARRAY[40,25,15,10,10];
  v_row record;
  v_rank integer;
  v_coins integer;
  v_done integer := 0;
  v_period date := (date_trunc('month', now()) - interval '1 month')::date;
BEGIN
  FOREACH v_module IN ARRAY ARRAY['kitchenstars','reel_battles'] LOOP
    SELECT * INTO v_pool FROM public.battle_prize_pools
    WHERE module = v_module AND period_month = v_period AND distributed_at IS NULL
    FOR UPDATE SKIP LOCKED;
    CONTINUE WHEN NOT FOUND OR v_pool.pool_coins <= 0;

    v_rank := 0;
    IF v_module = 'kitchenstars' THEN
      FOR v_row IN
        SELECT p.user_id, count(*) FILTER (WHERE b.winner_participant_id = p.id) AS wins,
               COALESCE(sum(p.vote_count), 0) AS votes
        FROM public.kitchen_battle_participants p
        JOIN public.kitchen_battles b ON b.id = p.battle_id
        WHERE p.created_at >= v_period AND p.created_at < v_period + interval '1 month'
        GROUP BY p.user_id
        ORDER BY wins DESC, votes DESC
        LIMIT 5
      LOOP
        v_rank := v_rank + 1;
        v_coins := floor(v_pool.pool_coins * v_percents[v_rank] / 100.0);
        IF v_coins > 0 THEN
          PERFORM public.battle_coins_apply(v_row.user_id, v_coins, 'monthly_prize', v_module, v_pool.id);
        END IF;
        INSERT INTO public.battle_prize_payouts (module, period_month, rank, user_id, percent, coins)
        VALUES (v_module, v_period, v_rank, v_row.user_id, v_percents[v_rank], v_coins)
        ON CONFLICT (module, period_month, rank) DO NOTHING;
      END LOOP;
    ELSE
      FOR v_row IN
        SELECT p.user_id, count(*) FILTER (WHERE b.winner_participant_id = p.id) AS wins,
               COALESCE(sum(p.vote_count), 0) AS votes
        FROM public.reel_battle_participants p
        JOIN public.reel_battles b ON b.id = p.battle_id
        WHERE p.created_at >= v_period AND p.created_at < v_period + interval '1 month'
        GROUP BY p.user_id
        ORDER BY wins DESC, votes DESC
        LIMIT 5
      LOOP
        v_rank := v_rank + 1;
        v_coins := floor(v_pool.pool_coins * v_percents[v_rank] / 100.0);
        IF v_coins > 0 THEN
          PERFORM public.battle_coins_apply(v_row.user_id, v_coins, 'monthly_prize', v_module, v_pool.id);
        END IF;
        INSERT INTO public.battle_prize_payouts (module, period_month, rank, user_id, percent, coins)
        VALUES (v_module, v_period, v_rank, v_row.user_id, v_percents[v_rank], v_coins)
        ON CONFLICT (module, period_month, rank) DO NOTHING;
      END LOOP;
    END IF;

    UPDATE public.battle_prize_pools SET distributed_at = now(), updated_at = now() WHERE id = v_pool.id;
    v_done := v_done + 1;
  END LOOP;
  RETURN v_done;
END; $$;
REVOKE ALL ON FUNCTION public.distribute_battle_prize_pools() FROM PUBLIC;

-- ============ SETTLEMENT: winner 80%, pool 20% ============
CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0; v_pot integer; v_prize integer;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.kitchen_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.kitchen_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    SELECT count(*) * 500 INTO v_pot FROM public.kitchen_battle_participants WHERE battle_id = v_battle.id;
    v_prize := floor(v_pot * 0.8);

    IF v_prize > 0 THEN
      PERFORM public.battle_coins_apply(v_winner.user_id, v_prize, 'battle_prize', 'kitchenstars', v_battle.id);
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

    SELECT count(*) * 500 INTO v_pot FROM public.reel_battle_participants WHERE battle_id = v_battle.id;
    v_prize := floor(v_pot * 0.8);

    IF v_prize > 0 THEN
      PERFORM public.battle_coins_apply(v_winner.user_id, v_prize, 'battle_prize', 'reel_battles', v_battle.id);
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

-- monthly cron on the 1st at 00:30 UTC
SELECT cron.unschedule('distribute-battle-prize-pools')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'distribute-battle-prize-pools');
SELECT cron.schedule('distribute-battle-prize-pools', '30 0 1 * *',
  $$SELECT public.distribute_battle_prize_pools();$$);