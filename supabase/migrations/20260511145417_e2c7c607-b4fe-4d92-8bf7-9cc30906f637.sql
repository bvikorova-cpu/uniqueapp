
CREATE OR REPLACE FUNCTION public.finalize_iq_tournaments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comp RECORD;
  part RECORD;
  pct numeric;
  award integer;
  finalized_count integer := 0;
  rk integer;
BEGIN
  FOR comp IN
    SELECT id, prize_pool
    FROM public.iq_competitions
    WHERE status <> 'finalized'
      AND end_time IS NOT NULL
      AND end_time < now()
  LOOP
    rk := 0;
    FOR part IN
      SELECT user_id, score
      FROM public.iq_competition_participants
      WHERE competition_id = comp.id
      ORDER BY COALESCE(score,0) DESC, joined_at ASC
      LIMIT 3
    LOOP
      rk := rk + 1;
      pct := CASE rk WHEN 1 THEN 0.60 WHEN 2 THEN 0.25 WHEN 3 THEN 0.15 ELSE 0 END;
      award := GREATEST(0, FLOOR(COALESCE(comp.prize_pool,0) * pct))::integer;

      UPDATE public.iq_competition_participants
        SET rank = rk, prize_amount = award
        WHERE competition_id = comp.id AND user_id = part.user_id;

      IF award > 0 THEN
        INSERT INTO public.iq_tournament_payouts (competition_id, user_id, rank, credits_awarded)
        VALUES (comp.id, part.user_id, rk, award)
        ON CONFLICT DO NOTHING;

        INSERT INTO public.iq_credits (user_id, balance)
        VALUES (part.user_id, award)
        ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + EXCLUDED.balance, updated_at = now();
      END IF;
    END LOOP;

    UPDATE public.iq_competitions
      SET status = 'finalized', finalized_at = now(), updated_at = now()
      WHERE id = comp.id;
    finalized_count := finalized_count + 1;
  END LOOP;

  RETURN finalized_count;
END;
$$;

DO $$
BEGIN
  PERFORM cron.unschedule('finalize-iq-tournaments');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'finalize-iq-tournaments',
  '5 * * * *',
  $$ SELECT public.finalize_iq_tournaments(); $$
);
