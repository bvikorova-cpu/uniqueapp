CREATE TABLE public.support_lounge_dms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  from_nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  credits_charged INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_lounge_dms_to ON public.support_lounge_dms (to_user_id, created_at DESC);
CREATE INDEX idx_support_lounge_dms_from ON public.support_lounge_dms (from_user_id, created_at DESC);

GRANT SELECT ON public.support_lounge_dms TO authenticated;
GRANT ALL ON public.support_lounge_dms TO service_role;

ALTER TABLE public.support_lounge_dms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read their private messages"
ON public.support_lounge_dms FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_lounge_dms;