CREATE TABLE public.support_lounge_nicknames (
  user_id uuid PRIMARY KEY,
  nickname text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.support_lounge_nicknames TO authenticated;
GRANT INSERT, UPDATE ON public.support_lounge_nicknames TO authenticated;
GRANT ALL ON public.support_lounge_nicknames TO service_role;
ALTER TABLE public.support_lounge_nicknames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nicknames visible to members" ON public.support_lounge_nicknames FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users set own nickname" ON public.support_lounge_nicknames FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own nickname" ON public.support_lounge_nicknames FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.support_lounge_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pass_date date NOT NULL DEFAULT CURRENT_DATE,
  credits_charged integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, pass_date)
);
GRANT SELECT ON public.support_lounge_passes TO authenticated;
GRANT ALL ON public.support_lounge_passes TO service_role;
ALTER TABLE public.support_lounge_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own passes" ON public.support_lounge_passes FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.support_lounge_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL,
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_lounge_messages TO authenticated;
GRANT ALL ON public.support_lounge_messages TO service_role;
ALTER TABLE public.support_lounge_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read room messages" ON public.support_lounge_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members post own messages" ON public.support_lounge_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_support_lounge_messages_room ON public.support_lounge_messages (room, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_lounge_messages;