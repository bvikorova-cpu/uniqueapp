ALTER TABLE public.premium_videos ADD COLUMN IF NOT EXISTS frame_slug TEXT;

CREATE TABLE IF NOT EXISTS public.video_frame_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  frame_slug TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, frame_slug)
);

GRANT SELECT, INSERT ON public.video_frame_purchases TO authenticated;
GRANT ALL ON public.video_frame_purchases TO service_role;

ALTER TABLE public.video_frame_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own frame purchases"
  ON public.video_frame_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_video_frame_purchases_updated_at
  BEFORE UPDATE ON public.video_frame_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.video_frame_cost(_slug TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _slug
    WHEN 'vframe_none' THEN 0
    WHEN 'vframe_soft_glow' THEN 2
    WHEN 'vframe_neon_pulse' THEN 3
    WHEN 'vframe_gold_luxe' THEN 3
    WHEN 'vframe_chrome_edge' THEN 4
    WHEN 'vframe_battle_shards' THEN 5
    WHEN 'vframe_aurora_wave' THEN 5
    WHEN 'vframe_cyber_grid' THEN 6
    WHEN 'vframe_rose_bloom' THEN 6
    WHEN 'vframe_holo_prism' THEN 8
    WHEN 'vframe_mythic_crown' THEN 10
    ELSE NULL
  END
$$;

CREATE OR REPLACE FUNCTION public.buy_video_frame(_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_cost INTEGER;
  v_balance INTEGER;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  v_cost := public.video_frame_cost(_slug);
  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unknown_frame');
  END IF;

  IF EXISTS (SELECT 1 FROM public.video_frame_purchases WHERE user_id = v_uid AND frame_slug = _slug) THEN
    RETURN jsonb_build_object('ok', true, 'already_owned', true);
  END IF;

  IF v_cost > 0 THEN
    SELECT credits_remaining INTO v_balance
      FROM public.video_credits WHERE user_id = v_uid FOR UPDATE;

    IF v_balance IS NULL OR v_balance < v_cost THEN
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'cost', v_cost, 'balance', COALESCE(v_balance, 0));
    END IF;

    UPDATE public.video_credits
      SET credits_remaining = credits_remaining - v_cost,
          last_used_at = now(),
          updated_at = now()
      WHERE user_id = v_uid;

    INSERT INTO public.video_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
    VALUES (v_uid, -v_cost, v_balance, v_balance - v_cost, 'video_frame_purchase', _slug);
  END IF;

  INSERT INTO public.video_frame_purchases (user_id, frame_slug, credits_spent)
  VALUES (v_uid, _slug, v_cost)
  ON CONFLICT (user_id, frame_slug) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'balance', COALESCE(v_balance, 0) - v_cost);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_premium_video_frame(_video_id UUID, _slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.premium_videos WHERE id = _video_id AND user_id = v_uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owner');
  END IF;

  IF _slug IS NOT NULL AND _slug <> 'vframe_none' THEN
    IF public.video_frame_cost(_slug) IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'unknown_frame');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.video_frame_purchases WHERE user_id = v_uid AND frame_slug = _slug
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'not_owned');
    END IF;
  END IF;

  UPDATE public.premium_videos
    SET frame_slug = NULLIF(_slug, 'vframe_none'), updated_at = now()
    WHERE id = _video_id AND user_id = v_uid;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.buy_video_frame(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_premium_video_frame(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.video_frame_cost(TEXT) TO authenticated;