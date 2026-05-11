CREATE TABLE IF NOT EXISTS public.iq_notification_prefs (
  user_id UUID PRIMARY KEY,
  weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
  streak_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  duel_invite BOOLEAN NOT NULL DEFAULT TRUE,
  daily_challenge BOOLEAN NOT NULL DEFAULT TRUE,
  preferred_hour SMALLINT NOT NULL DEFAULT 9 CHECK (preferred_hour BETWEEN 0 AND 23),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own iq notif prefs"
  ON public.iq_notification_prefs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "insert own iq notif prefs"
  ON public.iq_notification_prefs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own iq notif prefs"
  ON public.iq_notification_prefs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
