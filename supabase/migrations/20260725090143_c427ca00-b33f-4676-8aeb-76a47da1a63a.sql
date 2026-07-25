
-- 1. Timeouts table
CREATE TABLE IF NOT EXISTS public.stream_chat_timeouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  muted_until TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  offense_count INTEGER NOT NULL DEFAULT 1,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stream_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stream_chat_timeouts TO authenticated;
GRANT ALL ON public.stream_chat_timeouts TO service_role;

ALTER TABLE public.stream_chat_timeouts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stream_chat_timeouts_lookup
  ON public.stream_chat_timeouts (stream_id, user_id, muted_until);

-- Visibility: the muted user, the creator, or admins
CREATE POLICY "View own or as creator/admin"
  ON public.stream_chat_timeouts FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_chat_timeouts.stream_id AND ip.user_id = auth.uid()
    )
  );

-- Only the stream's creator or admins may manually create/update timeouts.
-- Triggers run as SECURITY DEFINER and bypass this.
CREATE POLICY "Creator or admin manages timeouts"
  ON public.stream_chat_timeouts FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_chat_timeouts.stream_id AND ip.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_chat_timeouts.stream_id AND ip.user_id = auth.uid()
    )
  );

-- 2. Helper: is user currently muted in this stream?
CREATE OR REPLACE FUNCTION public.is_chat_muted(_stream_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stream_chat_timeouts
    WHERE stream_id = _stream_id
      AND user_id = _user_id
      AND muted_until > now()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_chat_muted(UUID, UUID) TO authenticated;

-- 3. Core: apply an escalating timeout
CREATE OR REPLACE FUNCTION public.apply_chat_timeout(
  _stream_id UUID,
  _user_id UUID,
  _base_minutes INTEGER,
  _reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev INTEGER := 0;
  v_minutes INTEGER;
BEGIN
  SELECT offense_count INTO v_prev
  FROM public.stream_chat_timeouts
  WHERE stream_id = _stream_id AND user_id = _user_id;

  v_minutes := LEAST(_base_minutes * POWER(2, COALESCE(v_prev, 0))::INTEGER, 1440);

  INSERT INTO public.stream_chat_timeouts (stream_id, user_id, muted_until, reason, offense_count)
  VALUES (_stream_id, _user_id, now() + (v_minutes || ' minutes')::interval, _reason, 1)
  ON CONFLICT (stream_id, user_id) DO UPDATE
    SET muted_until = GREATEST(EXCLUDED.muted_until, stream_chat_timeouts.muted_until),
        reason = EXCLUDED.reason,
        offense_count = stream_chat_timeouts.offense_count + 1,
        updated_at = now();
END;
$$;

-- 4. Trigger: on new report, if 3+ distinct reporters for same author in last hour → mute 15 min
CREATE OR REPLACE FUNCTION public.trg_auto_mute_on_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author UUID;
  v_stream UUID;
  v_reporter_count INTEGER;
BEGIN
  SELECT sm.user_id, sm.stream_id INTO v_author, v_stream
  FROM public.stream_messages sm
  WHERE sm.id = NEW.message_id;

  IF v_author IS NULL OR v_stream IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(DISTINCT smr.reporter_id) INTO v_reporter_count
  FROM public.stream_message_reports smr
  JOIN public.stream_messages sm ON sm.id = smr.message_id
  WHERE sm.stream_id = v_stream
    AND sm.user_id = v_author
    AND smr.created_at > now() - interval '1 hour';

  IF v_reporter_count >= 3 THEN
    PERFORM public.apply_chat_timeout(v_stream, v_author, 15, 'Multiple viewer reports');
    -- Also hide the reported message
    UPDATE public.stream_messages
       SET is_hidden = true, hidden_at = now()
     WHERE id = NEW.message_id AND is_hidden = false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_mute_on_reports ON public.stream_message_reports;
CREATE TRIGGER trg_auto_mute_on_reports
AFTER INSERT ON public.stream_message_reports
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_mute_on_reports();

-- 5. Trigger: spam flood — 6+ messages in 10 seconds → mute 5 min and hide the flooding message
CREATE OR REPLACE FUNCTION public.trg_auto_mute_on_spam()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_recent
  FROM public.stream_messages
  WHERE stream_id = NEW.stream_id
    AND user_id = NEW.user_id
    AND created_at > now() - interval '10 seconds';

  IF v_recent >= 6 THEN
    PERFORM public.apply_chat_timeout(NEW.stream_id, NEW.user_id, 5, 'Spam flood (rate limit)');
    NEW.is_hidden := true;
    NEW.hidden_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_mute_on_spam ON public.stream_messages;
CREATE TRIGGER trg_auto_mute_on_spam
BEFORE INSERT ON public.stream_messages
FOR EACH ROW EXECUTE FUNCTION public.trg_auto_mute_on_spam();

-- 6. Trigger: block inserts from currently-muted users
CREATE OR REPLACE FUNCTION public.trg_block_muted_chat()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_chat_muted(NEW.stream_id, NEW.user_id) THEN
    RAISE EXCEPTION 'You are temporarily muted in this chat'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_muted_chat ON public.stream_messages;
CREATE TRIGGER trg_block_muted_chat
BEFORE INSERT ON public.stream_messages
FOR EACH ROW EXECUTE FUNCTION public.trg_block_muted_chat();

-- 7. updated_at trigger
CREATE TRIGGER update_stream_chat_timeouts_updated_at
BEFORE UPDATE ON public.stream_chat_timeouts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
