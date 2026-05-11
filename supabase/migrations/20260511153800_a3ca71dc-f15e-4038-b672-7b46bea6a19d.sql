CREATE TABLE IF NOT EXISTS public.iq_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iq_notif_user_unread
  ON public.iq_notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.iq_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own iq notifs" ON public.iq_notifications;
CREATE POLICY "Users view own iq notifs"
ON public.iq_notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own iq notifs" ON public.iq_notifications;
CREATE POLICY "Users update own iq notifs"
ON public.iq_notifications FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own iq notifs" ON public.iq_notifications;
CREATE POLICY "Users delete own iq notifs"
ON public.iq_notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.create_iq_notification(
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _body TEXT DEFAULT NULL,
  _link TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id UUID;
BEGIN
  INSERT INTO public.iq_notifications (user_id, type, title, body, link, metadata)
  VALUES (_user_id, _type, _title, _body, _link, COALESCE(_metadata,'{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_iq_notifications_read(_ids UUID[] DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid UUID := auth.uid(); _n INT;
BEGIN
  IF _uid IS NULL THEN RETURN 0; END IF;
  IF _ids IS NULL THEN
    UPDATE public.iq_notifications SET is_read = true
      WHERE user_id = _uid AND is_read = false;
  ELSE
    UPDATE public.iq_notifications SET is_read = true
      WHERE user_id = _uid AND id = ANY(_ids);
  END IF;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;