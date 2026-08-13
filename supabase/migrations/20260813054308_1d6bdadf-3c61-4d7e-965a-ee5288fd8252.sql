
ALTER TABLE public.comedy_show_messages
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_by uuid,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_comedy_show_messages_show_created
  ON public.comedy_show_messages (show_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.comedy_chat_timeouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id uuid NOT NULL REFERENCES public.comedy_shows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  reason text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (show_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comedy_chat_timeouts TO authenticated;
GRANT ALL ON public.comedy_chat_timeouts TO service_role;

ALTER TABLE public.comedy_chat_timeouts ENABLE ROW LEVEL SECURITY;

-- Is the current user the performer of this show (or an admin)?
CREATE OR REPLACE FUNCTION public.is_comedy_show_moderator(_show_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.comedy_shows s
    JOIN public.comedian_profiles cp ON cp.id = s.comedian_id
    WHERE s.id = _show_id AND cp.user_id = _user_id
  ) OR public.has_role(_user_id, 'admin'::app_role)
    OR public.has_role(_user_id, 'moderator'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.is_comedy_chat_muted(_show_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.comedy_chat_timeouts t
    WHERE t.show_id = _show_id AND t.user_id = _user_id AND t.expires_at > now()
  );
$$;

DROP POLICY IF EXISTS "Timeouts visible to participants" ON public.comedy_chat_timeouts;
CREATE POLICY "Timeouts visible to participants"
ON public.comedy_chat_timeouts FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_comedy_show_moderator(show_id, auth.uid()));

DROP POLICY IF EXISTS "Moderators manage timeouts" ON public.comedy_chat_timeouts;
CREATE POLICY "Moderators manage timeouts"
ON public.comedy_chat_timeouts FOR ALL TO authenticated
USING (public.is_comedy_show_moderator(show_id, auth.uid()))
WITH CHECK (public.is_comedy_show_moderator(show_id, auth.uid()) AND created_by = auth.uid());

-- Message policies: hide moderated messages from viewers, allow moderators to moderate
DROP POLICY IF EXISTS "Anyone can view show messages" ON public.comedy_show_messages;
CREATE POLICY "Visible messages are public"
ON public.comedy_show_messages FOR SELECT
USING (
  is_hidden = false
  OR sender_id = auth.uid()
  OR public.is_comedy_show_moderator(show_id, auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.comedy_show_messages;
CREATE POLICY "Authenticated users can send messages"
ON public.comedy_show_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND is_hidden = false
  AND NOT public.is_comedy_chat_muted(show_id, auth.uid())
);

DROP POLICY IF EXISTS "Moderators can moderate messages" ON public.comedy_show_messages;
CREATE POLICY "Moderators can moderate messages"
ON public.comedy_show_messages FOR UPDATE TO authenticated
USING (public.is_comedy_show_moderator(show_id, auth.uid()))
WITH CHECK (public.is_comedy_show_moderator(show_id, auth.uid()));

DROP POLICY IF EXISTS "Senders and moderators can delete messages" ON public.comedy_show_messages;
CREATE POLICY "Senders and moderators can delete messages"
ON public.comedy_show_messages FOR DELETE TO authenticated
USING (sender_id = auth.uid() OR public.is_comedy_show_moderator(show_id, auth.uid()));

CREATE TRIGGER update_comedy_chat_timeouts_updated_at
BEFORE UPDATE ON public.comedy_chat_timeouts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
