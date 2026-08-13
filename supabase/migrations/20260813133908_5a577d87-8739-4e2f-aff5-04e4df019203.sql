
CREATE TABLE IF NOT EXISTS public.battle_monthly_champions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL CHECK (module IN ('kitchenstars','reel_battles','megatalent')),
  period date NOT NULL,
  rank integer NOT NULL CHECK (rank BETWEEN 1 AND 3),
  user_id uuid NOT NULL,
  points bigint NOT NULL DEFAULT 0,
  credits_awarded integer NOT NULL DEFAULT 0,
  perks text[] NOT NULL DEFAULT '{}',
  badge_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module, period, rank)
);

CREATE INDEX IF NOT EXISTS idx_bmc_user_active ON public.battle_monthly_champions (user_id, badge_expires_at DESC);

GRANT SELECT ON public.battle_monthly_champions TO anon;
GRANT SELECT ON public.battle_monthly_champions TO authenticated;
GRANT ALL ON public.battle_monthly_champions TO service_role;

ALTER TABLE public.battle_monthly_champions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Champions are public" ON public.battle_monthly_champions;
CREATE POLICY "Champions are public" ON public.battle_monthly_champions FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.settle_monthly_battle_champions(
  _module text,
  _period date DEFAULT (date_trunc('month', now() - interval '1 month'))::date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start timestamptz := date_trunc('month', _period::timestamptz);
  _end   timestamptz := date_trunc('month', _period::timestamptz) + interval '1 month';
  _rec record;
  _credits integer;
  _perks text[];
  _awarded jsonb := '[]'::jsonb;
BEGIN
  IF _module NOT IN ('kitchenstars','reel_battles','megatalent') THEN
    RAISE EXCEPTION 'UNKNOWN_MODULE';
  END IF;

  IF EXISTS (SELECT 1 FROM public.battle_monthly_champions WHERE module = _module AND period = _start::date) THEN
    RETURN jsonb_build_object('already_settled', true, 'module', _module, 'period', _start::date);
  END IF;

  FOR _rec IN
    WITH scores AS (
      SELECT p.user_id,
             (COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id) * 100
              + COALESCE(SUM(p.vote_count), 0))::bigint AS points
      FROM public.kitchen_battle_participants p
      JOIN public.kitchen_battles b ON b.id = p.battle_id
      WHERE _module = 'kitchenstars'
        AND p.user_id IS NOT NULL
        AND b.created_at >= _start AND b.created_at < _end
      GROUP BY p.user_id
      UNION ALL
      SELECT p.user_id,
             (COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id) * 100
              + COALESCE(SUM(p.vote_count), 0))::bigint AS points
      FROM public.reel_battle_participants p
      JOIN public.reel_battles b ON b.id = p.battle_id
      WHERE _module = 'reel_battles'
        AND p.user_id IS NOT NULL
        AND b.created_at >= _start AND b.created_at < _end
      GROUP BY p.user_id
      UNION ALL
      SELECT t.user_id, COALESCE(SUM(t.votes_count), 0)::bigint AS points
      FROM public.talent_submissions t
      WHERE _module = 'megatalent'
        AND t.user_id IS NOT NULL
        AND t.created_at >= _start AND t.created_at < _end
      GROUP BY t.user_id
    )
    SELECT user_id, points, ROW_NUMBER() OVER (ORDER BY points DESC, user_id) AS rnk
    FROM scores
    WHERE points > 0
    ORDER BY points DESC, user_id
    LIMIT 3
  LOOP
    _credits := CASE _rec.rnk WHEN 1 THEN 5000 WHEN 2 THEN 2500 ELSE 1000 END;
    _perks := CASE _rec.rnk
      WHEN 1 THEN ARRAY['gold_badge','gold_name','gold_video_frame']
      WHEN 2 THEN ARRAY['silver_badge','tshirt','cap']
      ELSE ARRAY['bronze_badge']
    END;

    INSERT INTO public.battle_monthly_champions
      (module, period, rank, user_id, points, credits_awarded, perks, badge_expires_at)
    VALUES (_module, _start::date, _rec.rnk, _rec.user_id, _rec.points, _credits, _perks, _end + interval '1 month');

    PERFORM public.add_ai_credits(
      _rec.user_id, _credits,
      format('%s monthly champion #%s (%s)', _module, _rec.rnk, to_char(_start, 'YYYY-MM')),
      'battle_monthly_champion'
    );

    _awarded := _awarded || jsonb_build_object(
      'rank', _rec.rnk, 'user_id', _rec.user_id, 'points', _rec.points, 'credits', _credits, 'perks', _perks
    );
  END LOOP;

  RETURN jsonb_build_object('module', _module, 'period', _start::date, 'awarded', _awarded);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_champion_badge(_user_id uuid)
RETURNS TABLE(module text, rank integer, period date, perks text[], badge_expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.module, c.rank, c.period, c.perks, c.badge_expires_at
  FROM public.battle_monthly_champions c
  WHERE c.user_id = _user_id AND c.badge_expires_at > now()
  ORDER BY c.rank, c.badge_expires_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_module_champions(_module text)
RETURNS TABLE(rank integer, user_id uuid, display_name text, avatar_url text, points bigint, credits_awarded integer, perks text[], period date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.rank, c.user_id,
         COALESCE(NULLIF(pr.username, ''), NULLIF(pr.full_name, ''), 'Player'),
         pr.avatar_url, c.points, c.credits_awarded, c.perks, c.period
  FROM public.battle_monthly_champions c
  LEFT JOIN public.profiles pr ON pr.id = c.user_id
  WHERE c.module = _module
    AND c.period = (SELECT MAX(period) FROM public.battle_monthly_champions WHERE module = _module)
  ORDER BY c.rank;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_champion_badge(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_module_champions(text) TO anon, authenticated;

SELECT cron.schedule(
  'settle-monthly-battle-champions',
  '20 1 1 * *',
  $$SELECT public.settle_monthly_battle_champions('kitchenstars'),
           public.settle_monthly_battle_champions('reel_battles'),
           public.settle_monthly_battle_champions('megatalent');$$
);
