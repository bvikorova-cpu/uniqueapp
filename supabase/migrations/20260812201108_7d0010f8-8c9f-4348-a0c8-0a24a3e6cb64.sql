CREATE TABLE IF NOT EXISTS public.concert_chat_messages (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references public.live_concert_streams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null default 'Anonymous',
  content text not null,
  created_at timestamptz not null default now()
);
CREATE INDEX IF NOT EXISTS idx_concert_chat_messages_concert ON public.concert_chat_messages(concert_id, created_at);
GRANT SELECT, INSERT ON public.concert_chat_messages TO authenticated;
GRANT ALL ON public.concert_chat_messages TO service_role;
ALTER TABLE public.concert_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read concert chat" ON public.concert_chat_messages;
CREATE POLICY "Authenticated can read concert chat" ON public.concert_chat_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users insert own concert chat" ON public.concert_chat_messages;
CREATE POLICY "Users insert own concert chat" ON public.concert_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.concert_chat_messages REPLICA IDENTITY FULL;
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.concert_chat_messages';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;