
-- Trigger: notify both users on mutual interest
CREATE OR REPLACE FUNCTION public.notify_exclusive_mutual_interest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reverse_exists BOOLEAN;
  a_pseudo TEXT;
  b_pseudo TEXT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.exclusive_connection_interests
    WHERE from_user = NEW.to_user AND to_user = NEW.from_user
  ) INTO reverse_exists;

  IF NOT reverse_exists THEN
    RETURN NEW;
  END IF;

  SELECT pseudonym INTO a_pseudo FROM public.exclusive_connection_profiles WHERE user_id = NEW.from_user;
  SELECT pseudonym INTO b_pseudo FROM public.exclusive_connection_profiles WHERE user_id = NEW.to_user;

  -- Notify the NEW sender (they just triggered the match)
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, metadata)
  VALUES (
    NEW.from_user, NEW.to_user, 'exclusive_match',
    'Mutual match',
    'You matched with ' || COALESCE(b_pseudo, 'a member') || '. Private channel unlocked.',
    '/exclusive/connection?tab=matches',
    jsonb_build_object('other_user', NEW.to_user, 'pseudonym', b_pseudo)
  );

  -- Notify the other party
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, metadata)
  VALUES (
    NEW.to_user, NEW.from_user, 'exclusive_match',
    'Mutual match',
    'You matched with ' || COALESCE(a_pseudo, 'a member') || '. Private channel unlocked.',
    '/exclusive/connection?tab=matches',
    jsonb_build_object('other_user', NEW.from_user, 'pseudonym', a_pseudo)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_exclusive_mutual_interest ON public.exclusive_connection_interests;
CREATE TRIGGER trg_notify_exclusive_mutual_interest
  AFTER INSERT ON public.exclusive_connection_interests
  FOR EACH ROW EXECUTE FUNCTION public.notify_exclusive_mutual_interest();

-- RPC: caller notifies the other match that they opened the private channel
CREATE OR REPLACE FUNCTION public.notify_exclusive_channel_opened(_other_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mutual BOOLEAN;
  me_pseudo TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT
    EXISTS(SELECT 1 FROM public.exclusive_connection_interests WHERE from_user = auth.uid() AND to_user = _other_user)
    AND
    EXISTS(SELECT 1 FROM public.exclusive_connection_interests WHERE from_user = _other_user AND to_user = auth.uid())
  INTO is_mutual;

  IF NOT is_mutual THEN
    RETURN;
  END IF;

  SELECT pseudonym INTO me_pseudo FROM public.exclusive_connection_profiles WHERE user_id = auth.uid();

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, metadata)
  VALUES (
    _other_user, auth.uid(), 'exclusive_channel_opened',
    'Channel opened',
    COALESCE(me_pseudo, 'Your match') || ' opened your private channel.',
    '/messenger?to=' || auth.uid()::text,
    jsonb_build_object('other_user', auth.uid(), 'pseudonym', me_pseudo)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_exclusive_channel_opened(UUID) TO authenticated;
