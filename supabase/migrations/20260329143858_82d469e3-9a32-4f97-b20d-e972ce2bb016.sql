CREATE TABLE IF NOT EXISTS public.masterchef_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.masterchef_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages" ON public.masterchef_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own messages" ON public.masterchef_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.masterchef_chat_messages;