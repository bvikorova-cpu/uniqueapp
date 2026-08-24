CREATE TABLE public.premium_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer,
  unlock_cost integer NOT NULL DEFAULT 1,
  unlocks_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium_videos TO authenticated;
GRANT ALL ON public.premium_videos TO service_role;
ALTER TABLE public.premium_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published premium videos are viewable by authenticated"
  ON public.premium_videos FOR SELECT TO authenticated
  USING (is_published OR user_id = auth.uid());
CREATE POLICY "Users can upload own premium videos"
  ON public.premium_videos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own premium videos"
  ON public.premium_videos FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own premium videos"
  ON public.premium_videos FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_premium_videos_created ON public.premium_videos (created_at DESC);
CREATE INDEX idx_premium_videos_user ON public.premium_videos (user_id);

CREATE TABLE public.premium_video_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.premium_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  credits_spent integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (video_id, user_id)
);

GRANT SELECT ON public.premium_video_unlocks TO authenticated;
GRANT ALL ON public.premium_video_unlocks TO service_role;
ALTER TABLE public.premium_video_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own unlocks"
  ON public.premium_video_unlocks FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.premium_videos v WHERE v.id = video_id AND v.user_id = auth.uid()
  ));

CREATE TABLE public.premium_video_creator_balance (
  user_id uuid PRIMARY KEY,
  pending_credits numeric NOT NULL DEFAULT 0,
  credited_total integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.premium_video_creator_balance TO authenticated;
GRANT ALL ON public.premium_video_creator_balance TO service_role;
ALTER TABLE public.premium_video_creator_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators see own video balance"
  ON public.premium_video_creator_balance FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.premium_videos_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_premium_videos_updated_at
  BEFORE UPDATE ON public.premium_videos
  FOR EACH ROW EXECUTE FUNCTION public.premium_videos_touch_updated_at();

CREATE OR REPLACE FUNCTION public.unlock_premium_video(_video_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost integer;
  _owner uuid;
  _before integer;
  _pending numeric;
  _whole integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT unlock_cost, user_id INTO _cost, _owner
  FROM public.premium_videos WHERE id = _video_id AND is_published;
  IF _cost IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'video_not_found');
  END IF;

  IF _owner = _uid THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'owner', true);
  END IF;

  IF EXISTS (SELECT 1 FROM public.premium_video_unlocks WHERE video_id = _video_id AND user_id = _uid) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  SELECT credits_remaining INTO _before FROM public.ai_credits WHERE user_id = _uid FOR UPDATE;
  IF _before IS NULL OR _before < _cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(_before, 0));
  END IF;

  UPDATE public.ai_credits
     SET credits_remaining = _before - _cost, last_used_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES (_uid, -_cost, _before, _before - _cost, 'premium_video_unlock', 'premium_videos', _uid);

  INSERT INTO public.premium_video_unlocks (video_id, user_id, credits_spent)
  VALUES (_video_id, _uid, _cost);

  UPDATE public.premium_videos
     SET unlocks_count = unlocks_count + 1
   WHERE id = _video_id;

  -- Creator gets 50% of the credits; fractions accumulate until a whole credit.
  INSERT INTO public.premium_video_creator_balance (user_id, pending_credits)
  VALUES (_owner, _cost * 0.5)
  ON CONFLICT (user_id) DO UPDATE
    SET pending_credits = public.premium_video_creator_balance.pending_credits + EXCLUDED.pending_credits,
        updated_at = now();

  SELECT pending_credits INTO _pending FROM public.premium_video_creator_balance WHERE user_id = _owner;
  _whole := floor(_pending)::int;
  IF _whole >= 1 THEN
    PERFORM public.add_ai_credits(_owner, _whole, 'premium_video_earnings', 'premium_videos');
    UPDATE public.premium_video_creator_balance
       SET pending_credits = _pending - _whole,
           credited_total = credited_total + _whole,
           updated_at = now()
     WHERE user_id = _owner;
  END IF;

  RETURN jsonb_build_object('ok', true, 'balance', _before - _cost);
END;
$$;

CREATE OR REPLACE FUNCTION public.premium_video_add_view(_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.premium_videos SET views_count = views_count + 1 WHERE id = _video_id AND is_published;
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_premium_video(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.unlock_premium_video(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.premium_video_add_view(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.premium_video_add_view(uuid) TO authenticated;