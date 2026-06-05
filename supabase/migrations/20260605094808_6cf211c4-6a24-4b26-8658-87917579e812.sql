
-- M12: Server-side Season Pass tier claim with XP validation
CREATE OR REPLACE FUNCTION public.mt_claim_season_tier(_season_id text, _tier_level int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _xp int;
  _required int;
  _label text;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('error','not_authenticated');
  END IF;

  -- Tier catalog (must match client TIERS array)
  SELECT required_xp, reward_label INTO _required, _label FROM (VALUES
    (1, 0,    'Welcome badge'),
    (2, 50,   'Gold border on submissions'),
    (3, 150,  '+5 credits'),
    (4, 300,  'Spotlight slot for 24h'),
    (5, 500,  'Custom emote pack'),
    (6, 800,  'Free Battle Royale entry'),
    (7, 1200, 'Champion-only chat access')
  ) AS t(lvl, required_xp, reward_label)
  WHERE t.lvl = _tier_level;

  IF _required IS NULL THEN
    RETURN jsonb_build_object('error','invalid_tier');
  END IF;

  SELECT COALESCE(total_xp, 0) INTO _xp FROM public.user_xp WHERE user_id = _uid;
  IF COALESCE(_xp,0) < _required THEN
    RETURN jsonb_build_object('error','insufficient_xp','need', _required - COALESCE(_xp,0));
  END IF;

  INSERT INTO public.mt_season_pass_claims (user_id, season_id, tier_level, reward_label)
  VALUES (_uid, _season_id, _tier_level, _label)
  ON CONFLICT (user_id, season_id, tier_level) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'tier', _tier_level, 'reward', _label);
END;
$$;

GRANT EXECUTE ON FUNCTION public.mt_claim_season_tier(text, int) TO authenticated;

-- M13: Lock down direct inserts; force RPC path
DROP POLICY IF EXISTS "Users insert own season claims" ON public.mt_season_pass_claims;

-- M14: Performance indexes
CREATE INDEX IF NOT EXISTS idx_talent_votes_user_created ON public.talent_votes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mt_stories_user_expires ON public.mt_stories (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_mt_submission_reactions_user ON public.mt_submission_reactions (user_id, created_at DESC);
