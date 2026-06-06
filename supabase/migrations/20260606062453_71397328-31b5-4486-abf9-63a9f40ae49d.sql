
ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS compatibility_quiz jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS opening_move text,
  ADD COLUMN IF NOT EXISTS passport_location text,
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

ALTER TABLE public.dating_matches
  ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  ADD COLUMN IF NOT EXISTS first_message_at timestamptz,
  ADD COLUMN IF NOT EXISTS extended_once boolean DEFAULT false;

-- When first message is sent, clear expiry (match becomes permanent)
CREATE OR REPLACE FUNCTION public.dating_match_first_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m_id uuid;
BEGIN
  SELECT id INTO m_id FROM public.dating_matches
   WHERE (user1_id = NEW.sender_id AND user2_id = NEW.receiver_id)
      OR (user2_id = NEW.sender_id AND user1_id = NEW.receiver_id)
   LIMIT 1;
  IF m_id IS NOT NULL THEN
    UPDATE public.dating_matches
       SET first_message_at = COALESCE(first_message_at, now()),
           expires_at = NULL
     WHERE id = m_id AND first_message_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dating_match_first_message ON public.dating_messages;
CREATE TRIGGER trg_dating_match_first_message
AFTER INSERT ON public.dating_messages
FOR EACH ROW EXECUTE FUNCTION public.dating_match_first_message();
