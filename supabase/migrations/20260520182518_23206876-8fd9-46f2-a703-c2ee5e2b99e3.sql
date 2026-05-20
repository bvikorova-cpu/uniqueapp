CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.dispatch_push(_user_ids UUID[], _payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url TEXT := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/send-push';
  _anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q';
BEGIN
  PERFORM net.http_post(
    url := _url,
    body := jsonb_build_object('user_ids', _user_ids, 'payload', _payload),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _anon,
      'apikey', _anon
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'dispatch_push failed: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_call_signal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_name TEXT;
BEGIN
  IF NEW.event = 'offer' THEN
    SELECT COALESCE(full_name, username, 'Someone')
      INTO _caller_name
      FROM public.profiles
      WHERE id = NEW.sender_id
      LIMIT 1;

    PERFORM public.dispatch_push(
      ARRAY[NEW.receiver_id],
      jsonb_build_object(
        'kind', 'call',
        'title', COALESCE(_caller_name, 'Incoming call'),
        'body', 'is calling you…',
        'caller_id', NEW.sender_id,
        'conversation_id', NEW.conversation_id,
        'url', '/messenger'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;