-- M4: rate limit trigger for mt_submission_reactions (20 per 10s per user)
CREATE OR REPLACE FUNCTION public.mt_reactions_rate_limit_trg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE allowed boolean;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  SELECT public.mt_rate_limit_check(NEW.user_id, 'mt_reaction', 10, 20) INTO allowed;
  IF NOT COALESCE(allowed, true) THEN
    RAISE EXCEPTION 'rate_limit_exceeded: too many reactions, slow down' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS mt_reactions_rate_limit ON public.mt_submission_reactions;
CREATE TRIGGER mt_reactions_rate_limit
BEFORE INSERT ON public.mt_submission_reactions
FOR EACH ROW EXECUTE FUNCTION public.mt_reactions_rate_limit_trg();

-- M5a: talent_chat_messages — ban check + profanity + rate limit
CREATE OR REPLACE FUNCTION public.tcm_guard_trg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  allowed boolean;
  ban_count int;
  bad text;
  bad_words text[] := ARRAY['fuck','shit','bitch','asshole','cunt','nigger','faggot','retard','kurva','piča','jebat','kokot','mrdat'];
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  -- ban check (stream_id stored as category for chat)
  SELECT COUNT(*) INTO ban_count
  FROM public.live_chat_bans
  WHERE stream_id = NEW.category
    AND banned_user_id = NEW.user_id
    AND (expires_at IS NULL OR expires_at > now());
  IF ban_count > 0 THEN
    RAISE EXCEPTION 'user_banned: you are banned from this chat' USING ERRCODE = 'P0001';
  END IF;

  -- rate limit 8 per 10s
  SELECT public.mt_rate_limit_check(NEW.user_id, 'tcm_send', 10, 8) INTO allowed;
  IF NOT COALESCE(allowed, true) THEN
    RAISE EXCEPTION 'rate_limit_exceeded: slow down' USING ERRCODE = 'P0001';
  END IF;

  -- profanity filter
  IF NEW.body IS NOT NULL THEN
    FOREACH bad IN ARRAY bad_words LOOP
      IF position(bad in lower(NEW.body)) > 0 THEN
        NEW.body := regexp_replace(NEW.body, bad, repeat('*', length(bad)), 'gi');
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS tcm_guard ON public.talent_chat_messages;
CREATE TRIGGER tcm_guard
BEFORE INSERT ON public.talent_chat_messages
FOR EACH ROW EXECUTE FUNCTION public.tcm_guard_trg();

-- M5b: mt_marketplace_listings UPDATE — prevent seller_id forgery
DROP POLICY IF EXISTS "mt_list_update_own" ON public.mt_marketplace_listings;
CREATE POLICY "mt_list_update_own" ON public.mt_marketplace_listings
FOR UPDATE TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());