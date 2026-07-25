-- 1) Grants for social_gifts_* tables
GRANT SELECT ON public.social_gifts_badges TO anon, authenticated;
GRANT ALL   ON public.social_gifts_badges TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_gifts_user_progress TO authenticated;
GRANT ALL ON public.social_gifts_user_progress TO service_role;

GRANT SELECT, INSERT ON public.social_gifts_user_badges TO authenticated;
GRANT ALL ON public.social_gifts_user_badges TO service_role;

-- 2) Auto-award function
CREATE OR REPLACE FUNCTION public.award_social_gifts_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_val   INTEGER;
  v_prog  RECORD;
BEGIN
  SELECT * INTO v_prog FROM social_gifts_user_progress WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  FOR v_badge IN SELECT * FROM social_gifts_badges LOOP
    IF EXISTS (SELECT 1 FROM social_gifts_user_badges
               WHERE user_id = p_user_id AND badge_id = v_badge.id) THEN
      CONTINUE;
    END IF;

    v_val := CASE v_badge.requirement_type
      WHEN 'gifts_sent'     THEN COALESCE(v_prog.gifts_sent, 0)
      WHEN 'gifts_received' THEN COALESCE(v_prog.gifts_received, 0)
      WHEN 'streak'         THEN COALESCE(v_prog.streak_days, 0)
      WHEN 'credits_spent'  THEN COALESCE(v_prog.total_credits_spent, 0)
      WHEN 'level'          THEN COALESCE(v_prog.level, 1)
      ELSE 0
    END;

    IF v_val >= v_badge.requirement_value THEN
      INSERT INTO social_gifts_user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_social_gifts_badges(uuid) TO authenticated, service_role;

-- 3) Trigger on progress updates
CREATE OR REPLACE FUNCTION public.trg_award_social_gifts_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.award_social_gifts_badges(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS social_gifts_progress_award_badges ON public.social_gifts_user_progress;
CREATE TRIGGER social_gifts_progress_award_badges
AFTER INSERT OR UPDATE ON public.social_gifts_user_progress
FOR EACH ROW EXECUTE FUNCTION public.trg_award_social_gifts_badges();

-- 4) Backfill for all existing users
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM social_gifts_user_progress LOOP
    PERFORM public.award_social_gifts_badges(r.user_id);
  END LOOP;
END $$;