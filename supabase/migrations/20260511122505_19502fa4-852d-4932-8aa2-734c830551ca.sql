
CREATE TABLE IF NOT EXISTS public.iq_battle_pass_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_battle_pass_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON public.iq_battle_pass_seasons FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.iq_battle_pass_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.iq_battle_pass_seasons(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  premium_unlocked BOOLEAN NOT NULL DEFAULT false,
  claimed_tiers INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

ALTER TABLE public.iq_battle_pass_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bp progress"
  ON public.iq_battle_pass_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_iq_bp_progress_updated
  BEFORE UPDATE ON public.iq_battle_pass_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.award_iq_season_xp(amount INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_season_id UUID;
  v_new_xp INTEGER;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF amount IS NULL OR amount <= 0 OR amount > 500 THEN
    RAISE EXCEPTION 'Invalid xp amount';
  END IF;

  SELECT id INTO v_season_id FROM public.iq_battle_pass_seasons
    WHERE is_active = true AND now() BETWEEN starts_at AND ends_at
    ORDER BY season_number DESC LIMIT 1;
  IF v_season_id IS NULL THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'no_active_season');
  END IF;

  INSERT INTO public.iq_battle_pass_progress (user_id, season_id, xp)
  VALUES (v_user, v_season_id, amount)
  ON CONFLICT (user_id, season_id) DO UPDATE SET
    xp = public.iq_battle_pass_progress.xp + amount,
    updated_at = now()
  RETURNING xp INTO v_new_xp;

  RETURN jsonb_build_object('awarded', true, 'xp', v_new_xp, 'season_id', v_season_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_iq_battle_pass_tier(_tier INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_row public.iq_battle_pass_progress;
  v_season_id UUID;
  v_xp_needed INTEGER;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _tier < 1 OR _tier > 30 THEN RAISE EXCEPTION 'Invalid tier'; END IF;

  SELECT id INTO v_season_id FROM public.iq_battle_pass_seasons
    WHERE is_active = true ORDER BY season_number DESC LIMIT 1;
  IF v_season_id IS NULL THEN RAISE EXCEPTION 'No active season'; END IF;

  SELECT * INTO v_row FROM public.iq_battle_pass_progress
    WHERE user_id = v_user AND season_id = v_season_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'No progress yet'; END IF;

  v_xp_needed := _tier * 100;
  IF v_row.xp < v_xp_needed THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'insufficient_xp');
  END IF;
  IF _tier = ANY(v_row.claimed_tiers) THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed');
  END IF;

  UPDATE public.iq_battle_pass_progress
  SET claimed_tiers = array_append(claimed_tiers, _tier),
      updated_at = now()
  WHERE id = v_row.id;

  -- Free reward: every tier gives 1 IQ credit, premium tiers (every 5) give 3 extra if unlocked
  INSERT INTO public.iq_credits (user_id, balance) VALUES (v_user, 1)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + 1;

  IF v_row.premium_unlocked AND _tier % 5 = 0 THEN
    UPDATE public.iq_credits SET balance = balance + 3 WHERE user_id = v_user;
  END IF;

  RETURN jsonb_build_object('claimed', true, 'tier', _tier);
END;
$$;

INSERT INTO public.iq_battle_pass_seasons (season_number, name, starts_at, ends_at, is_active)
VALUES (1, 'Season 1: Genesis', now(), now() + INTERVAL '30 days', true)
ON CONFLICT (season_number) DO NOTHING;
