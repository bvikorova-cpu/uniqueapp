
-- Add scheduling + tier-gating fields to live_streams
ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS min_tier TEXT,
  ADD COLUMN IF NOT EXISTS total_tips_cents INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled_at ON public.live_streams(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON public.live_streams(is_live) WHERE is_live = true;

-- Tier ordering helper (bronze < silver < gold)
CREATE OR REPLACE FUNCTION public._tier_rank(_tier text)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(_tier,''))
    WHEN 'bronze' THEN 1
    WHEN 'silver' THEN 2
    WHEN 'gold' THEN 3
    ELSE 0
  END
$$;

-- Check if a user has access to a stream (public, own stream, or active fan-club member at required tier)
CREATE OR REPLACE FUNCTION public.has_live_stream_access(_user_id uuid, _stream_id uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  creator_uid uuid;
BEGIN
  SELECT ls.*, ip.user_id AS creator_user_id
  INTO s
  FROM public.live_streams ls
  LEFT JOIN public.influencer_profiles ip ON ip.id = ls.influencer_id
  WHERE ls.id = _stream_id;

  IF NOT FOUND THEN RETURN false; END IF;

  -- Open (no tier required)
  IF s.min_tier IS NULL OR s.min_tier = '' THEN RETURN true; END IF;

  -- Owner always allowed
  IF _user_id IS NOT NULL AND _user_id = s.creator_user_id THEN RETURN true; END IF;
  IF _user_id IS NULL THEN RETURN false; END IF;

  -- Active fan-club member at or above required tier for this creator
  RETURN EXISTS (
    SELECT 1
    FROM public.influencer_fan_club_members m
    JOIN public.influencer_fan_clubs c ON c.id = m.fan_club_id
    WHERE m.user_id = _user_id
      AND m.status = 'active'
      AND c.creator_id = s.creator_user_id
      AND public._tier_rank(c.tier) >= public._tier_rank(s.min_tier)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_live_stream_access(uuid, uuid) TO anon, authenticated;

-- Bump total tips on live_super_chats insert
CREATE OR REPLACE FUNCTION public._bump_stream_tips()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.live_streams
     SET total_tips_cents = total_tips_cents + NEW.amount_cents
   WHERE id = NEW.stream_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_stream_tips ON public.live_super_chats;
CREATE TRIGGER trg_bump_stream_tips
AFTER INSERT ON public.live_super_chats
FOR EACH ROW EXECUTE FUNCTION public._bump_stream_tips();

-- Enable realtime on the chat + stream tables (idempotent)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.live_super_chats; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
