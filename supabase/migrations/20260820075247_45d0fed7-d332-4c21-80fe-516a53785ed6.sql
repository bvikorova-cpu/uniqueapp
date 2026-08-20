-- Mirror unified XP (user_xp) into the Rewards store (user_points) so every XP
-- award shows up in the Rewards section with a single consistent number.
CREATE OR REPLACE FUNCTION public.sync_user_xp_to_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _delta integer;
  _new_total integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _delta := COALESCE(NEW.total_xp, 0);
  ELSE
    _delta := COALESCE(NEW.total_xp, 0) - COALESCE(OLD.total_xp, 0);
  END IF;

  IF _delta = 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_points (user_id, total_points, current_level_points, level)
  VALUES (NEW.user_id, GREATEST(_delta, 0), GREATEST(_delta, 0), 1)
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = GREATEST(public.user_points.total_points + _delta, 0),
        current_level_points = GREATEST(public.user_points.current_level_points + _delta, 0),
        updated_at = now()
  RETURNING total_points INTO _new_total;

  UPDATE public.user_points
     SET level = public.calculate_level(_new_total)
   WHERE user_id = NEW.user_id
     AND level <> public.calculate_level(_new_total);

  IF _delta > 0 THEN
    INSERT INTO public.activity_logs (user_id, activity_type, points_earned)
    VALUES (NEW.user_id, 'xp_sync', _delta);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_xp_to_user_points ON public.user_xp;
CREATE TRIGGER trg_sync_user_xp_to_user_points
AFTER INSERT OR UPDATE OF total_xp ON public.user_xp
FOR EACH ROW EXECUTE FUNCTION public.sync_user_xp_to_user_points();

-- One-time backfill: bring existing unified XP into the Rewards totals when it is higher.
INSERT INTO public.user_points (user_id, total_points, current_level_points, level)
SELECT x.user_id, x.total_xp, x.total_xp, 1
FROM public.user_xp x
ON CONFLICT (user_id) DO UPDATE
  SET total_points = GREATEST(public.user_points.total_points, EXCLUDED.total_points),
      current_level_points = GREATEST(public.user_points.current_level_points, EXCLUDED.current_level_points),
      updated_at = now();

UPDATE public.user_points
   SET level = public.calculate_level(total_points)
 WHERE level <> public.calculate_level(total_points);
