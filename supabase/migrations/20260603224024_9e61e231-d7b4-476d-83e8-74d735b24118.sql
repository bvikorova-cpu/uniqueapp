
ALTER TABLE public.user_points ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0;

UPDATE public.user_points SET longest_streak = GREATEST(longest_streak, COALESCE(login_streak, 0));

CREATE OR REPLACE FUNCTION public.update_longest_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.login_streak IS NOT NULL AND NEW.login_streak > COALESCE(NEW.longest_streak, 0) THEN
    NEW.longest_streak := NEW.login_streak;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_longest_streak ON public.user_points;
CREATE TRIGGER trg_update_longest_streak
BEFORE INSERT OR UPDATE OF login_streak ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_longest_streak();
