-- Kids Channel: real persistence for parental settings, game progress, magic library

-- 1. Parental settings (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.kids_parental_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  sleep_timer_enabled BOOLEAN NOT NULL DEFAULT false,
  daily_limit_minutes INTEGER NOT NULL DEFAULT 60,
  email_reports BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_parental_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their parental settings"
  ON public.kids_parental_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Kids game progress (persist scores)
CREATE TABLE IF NOT EXISTS public.kids_game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_id INTEGER NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  total_plays INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.kids_game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their game progress"
  ON public.kids_game_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kids_game_progress_user ON public.kids_game_progress(user_id);

-- 3. Parental gate audit log (so parents can review when AI features were unlocked)
CREATE TABLE IF NOT EXISTS public.kids_parental_gate_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_parental_gate_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their gate logs"
  ON public.kids_parental_gate_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their gate logs"
  ON public.kids_parental_gate_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kids_gate_log_user ON public.kids_parental_gate_log(user_id, verified_at DESC);

-- 4. Trigger to keep updated_at fresh (reuse existing function if present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $f$;
  END IF;
END$$;

DROP TRIGGER IF EXISTS trg_kids_parental_settings_updated ON public.kids_parental_settings;
CREATE TRIGGER trg_kids_parental_settings_updated
  BEFORE UPDATE ON public.kids_parental_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_kids_game_progress_updated ON public.kids_game_progress;
CREATE TRIGGER trg_kids_game_progress_updated
  BEFORE UPDATE ON public.kids_game_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();