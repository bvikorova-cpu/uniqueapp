
-- Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subs - select"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push subs - insert"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own push subs - update"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push subs - delete"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_push_subs_updated
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure pg_net is available
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Helper: dispatch push via edge function
CREATE OR REPLACE FUNCTION public.dispatch_push(_user_ids UUID[], _payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url TEXT := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/send-push';
  _anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q';
BEGIN
  PERFORM extensions.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon,
      'apikey', _anon
    ),
    body := jsonb_build_object('user_ids', _user_ids, 'payload', _payload)
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'dispatch_push failed: %', SQLERRM;
END;
$$;

-- Trigger: incoming call offer
CREATE OR REPLACE FUNCTION public.notify_call_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_name TEXT;
BEGIN
  IF NEW.type = 'offer' THEN
    SELECT COALESCE(display_name, username, 'Someone')
      INTO _caller_name
      FROM public.profiles
      WHERE user_id = NEW.sender_id
      LIMIT 1;

    PERFORM public.dispatch_push(
      ARRAY[NEW.receiver_id],
      jsonb_build_object(
        'kind', 'call',
        'title', COALESCE(_caller_name, 'Incoming call'),
        'body', 'is calling you…',
        'caller_id', NEW.sender_id,
        'url', '/messenger'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_call_signal ON public.call_signals;
CREATE TRIGGER trg_notify_call_signal
  AFTER INSERT ON public.call_signals
  FOR EACH ROW EXECUTE FUNCTION public.notify_call_signal();

-- Trigger: new message → push to other conversation participants
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recipients UUID[];
  _sender_name TEXT;
  _preview TEXT;
BEGIN
  SELECT array_agg(user_id) INTO _recipients
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id <> NEW.sender_id;

  IF _recipients IS NULL OR array_length(_recipients,1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(display_name, username, 'New message')
    INTO _sender_name
    FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;

  _preview := COALESCE(LEFT(NEW.content, 120), 'Sent a message');

  PERFORM public.dispatch_push(
    _recipients,
    jsonb_build_object(
      'kind', 'message',
      'title', COALESCE(_sender_name, 'New message'),
      'body', _preview,
      'conversation_id', NEW.conversation_id,
      'url', '/messenger'
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
