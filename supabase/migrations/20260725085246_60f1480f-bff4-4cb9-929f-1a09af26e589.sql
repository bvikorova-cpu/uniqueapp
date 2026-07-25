
-- =========================================================
-- 1. stream_highlights
-- =========================================================
CREATE TABLE IF NOT EXISTS public.stream_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('top_tip','chat_moment')),
  rank INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stream_highlights_stream_idx ON public.stream_highlights(stream_id, kind, rank);

GRANT SELECT ON public.stream_highlights TO anon, authenticated;
GRANT ALL ON public.stream_highlights TO service_role;
ALTER TABLE public.stream_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights are viewable by all"
  ON public.stream_highlights FOR SELECT
  USING (true);

CREATE POLICY "Creator manages own stream highlights"
  ON public.stream_highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_highlights.stream_id AND ip.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_highlights.stream_id AND ip.user_id = auth.uid()
    )
  );

-- =========================================================
-- 2. stream_viewer_sessions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.stream_viewer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  watch_seconds INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS svs_stream_idx ON public.stream_viewer_sessions(stream_id, joined_at);
CREATE INDEX IF NOT EXISTS svs_user_idx ON public.stream_viewer_sessions(user_id);

GRANT SELECT, INSERT, UPDATE ON public.stream_viewer_sessions TO authenticated;
GRANT ALL ON public.stream_viewer_sessions TO service_role;
ALTER TABLE public.stream_viewer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own viewer session"
  ON public.stream_viewer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users update own viewer session"
  ON public.stream_viewer_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own viewer session"
  ON public.stream_viewer_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_viewer_sessions.stream_id AND ip.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- =========================================================
-- 3. stream_messages: hidden flags
-- =========================================================
ALTER TABLE public.stream_messages
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_by UUID,
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- =========================================================
-- 4. stream_message_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.stream_message_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.stream_messages(id) ON DELETE CASCADE,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','actioned','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  UNIQUE(message_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS smr_stream_idx ON public.stream_message_reports(stream_id, status);

GRANT SELECT, INSERT ON public.stream_message_reports TO authenticated;
GRANT UPDATE ON public.stream_message_reports TO authenticated;
GRANT ALL ON public.stream_message_reports TO service_role;
ALTER TABLE public.stream_message_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users report messages"
  ON public.stream_message_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporter or creator/admin can read"
  ON public.stream_message_reports FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_message_reports.stream_id AND ip.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Creator/admin update reports"
  ON public.stream_message_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
      WHERE ls.id = stream_message_reports.stream_id AND ip.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- =========================================================
-- 5. Highlight generation trigger on stream end
-- =========================================================
CREATE OR REPLACE FUNCTION public.generate_stream_highlights()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tip RECORD;
  r INTEGER := 1;
  moment RECORD;
BEGIN
  IF NEW.is_live = false AND (OLD.is_live IS DISTINCT FROM NEW.is_live) THEN
    -- Skip if already generated
    IF EXISTS (SELECT 1 FROM public.stream_highlights WHERE stream_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- Top 3 tips
    FOR tip IN
      SELECT id, sender_id, amount_cents, message, highlight_color, created_at
      FROM public.live_super_chats
      WHERE stream_id = NEW.id
      ORDER BY amount_cents DESC
      LIMIT 3
    LOOP
      INSERT INTO public.stream_highlights (stream_id, kind, rank, title, payload)
      VALUES (
        NEW.id,
        'top_tip',
        r,
        'Top tip: €' || (tip.amount_cents::numeric / 100)::text,
        jsonb_build_object(
          'super_chat_id', tip.id,
          'sender_id', tip.sender_id,
          'amount_cents', tip.amount_cents,
          'message', tip.message,
          'color', tip.highlight_color,
          'at', tip.created_at
        )
      );
      r := r + 1;
    END LOOP;

    -- Top 3 chat moments (60-second buckets with most messages, excluding hidden)
    r := 1;
    FOR moment IN
      SELECT
        date_trunc('minute', created_at) AS bucket,
        count(*)::int AS msg_count,
        (array_agg(message ORDER BY created_at))[1:5] AS sample
      FROM public.stream_messages
      WHERE stream_id = NEW.id AND COALESCE(is_hidden,false) = false
      GROUP BY 1
      HAVING count(*) >= 3
      ORDER BY msg_count DESC
      LIMIT 3
    LOOP
      INSERT INTO public.stream_highlights (stream_id, kind, rank, title, payload)
      VALUES (
        NEW.id,
        'chat_moment',
        r,
        'Chat peak (' || moment.msg_count || ' msgs)',
        jsonb_build_object(
          'bucket_at', moment.bucket,
          'message_count', moment.msg_count,
          'sample_messages', moment.sample
        )
      );
      r := r + 1;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_stream_highlights ON public.live_streams;
CREATE TRIGGER trg_generate_stream_highlights
AFTER UPDATE ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.generate_stream_highlights();

-- =========================================================
-- 6. Notify followers when stream goes live
-- =========================================================
CREATE OR REPLACE FUNCTION public.notify_followers_on_go_live()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator RECORD;
BEGIN
  IF NEW.is_live = true AND (OLD.is_live IS DISTINCT FROM NEW.is_live) THEN
    SELECT ip.display_name, ip.user_id, ip.id AS influencer_id
      INTO creator
    FROM public.influencer_profiles ip
    WHERE ip.id = NEW.influencer_id;

    IF creator.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url, metadata)
      SELECT
        f.follower_id,
        creator.user_id,
        (COALESCE(creator.display_name,'A creator') || ' is LIVE'),
        NEW.title,
        'stream_live',
        NEW.id,
        '/live/' || NEW.id::text,
        jsonb_build_object('stream_id', NEW.id, 'creator_id', creator.influencer_id)
      FROM public.influencer_followers f
      WHERE f.influencer_id = creator.influencer_id
        AND f.follower_id IS NOT NULL
        AND f.follower_id <> creator.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_go_live ON public.live_streams;
CREATE TRIGGER trg_notify_go_live
AFTER UPDATE ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.notify_followers_on_go_live();

-- =========================================================
-- 7. Notify followers before scheduled stream starts (cron)
-- =========================================================
ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS reminders_sent BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.notify_upcoming_scheduled_streams()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  creator RECORD;
BEGIN
  FOR s IN
    SELECT * FROM public.live_streams
    WHERE reminders_sent = false
      AND scheduled_at IS NOT NULL
      AND scheduled_at > now()
      AND scheduled_at <= now() + interval '15 minutes'
      AND COALESCE(is_live,false) = false
  LOOP
    SELECT ip.display_name, ip.user_id, ip.id AS influencer_id
      INTO creator
    FROM public.influencer_profiles ip
    WHERE ip.id = s.influencer_id;

    IF creator.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url, metadata)
      SELECT
        f.follower_id,
        creator.user_id,
        (COALESCE(creator.display_name,'A creator') || ' goes live soon'),
        s.title,
        'stream_reminder',
        s.id,
        '/live/' || s.id::text,
        jsonb_build_object('stream_id', s.id, 'scheduled_at', s.scheduled_at)
      FROM public.influencer_followers f
      WHERE f.influencer_id = creator.influencer_id
        AND f.follower_id IS NOT NULL
        AND f.follower_id <> creator.user_id;
    END IF;

    UPDATE public.live_streams SET reminders_sent = true WHERE id = s.id;
  END LOOP;
END;
$$;

-- Cron every 5 minutes (safe to re-schedule)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('notify-upcoming-streams') FROM cron.job WHERE jobname='notify-upcoming-streams';
    PERFORM cron.schedule('notify-upcoming-streams', '*/5 * * * *', $cron$SELECT public.notify_upcoming_scheduled_streams();$cron$);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Realtime for new tables
DO $$
BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='stream_highlights';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_highlights';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
