CREATE TABLE public.support_lounge_identities (
  user_id uuid PRIMARY KEY,
  lounge_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.support_lounge_identities TO service_role;
ALTER TABLE public.support_lounge_identities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.support_lounge_messages_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL,
  sender_lounge_id uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  nickname text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.support_lounge_messages_v2 TO service_role;
ALTER TABLE public.support_lounge_messages_v2 ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_support_lounge_messages_v2_room ON public.support_lounge_messages_v2 (room, created_at DESC);

CREATE TABLE public.support_lounge_dms_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_lounge_id uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  to_lounge_id uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  from_nickname text NOT NULL,
  content text NOT NULL,
  credits_charged integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.support_lounge_dms_v2 TO service_role;
ALTER TABLE public.support_lounge_dms_v2 ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_support_lounge_dms_v2_to ON public.support_lounge_dms_v2 (to_lounge_id, created_at DESC);
CREATE INDEX idx_support_lounge_dms_v2_from ON public.support_lounge_dms_v2 (from_lounge_id, created_at DESC);

CREATE TABLE public.support_lounge_attendance (
  lounge_id uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  room text NOT NULL,
  first_visited_at timestamptz NOT NULL DEFAULT now(),
  last_visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lounge_id, room)
);
GRANT ALL ON public.support_lounge_attendance TO service_role;
ALTER TABLE public.support_lounge_attendance ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_support_lounge_attendance_room ON public.support_lounge_attendance (room, lounge_id);

CREATE TABLE public.support_lounge_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_a uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  member_b uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.support_lounge_identities(lounge_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_a, member_b)
);
GRANT ALL ON public.support_lounge_contacts TO service_role;
ALTER TABLE public.support_lounge_contacts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_support_lounge_contacts_a ON public.support_lounge_contacts (member_a, status);
CREATE INDEX idx_support_lounge_contacts_b ON public.support_lounge_contacts (member_b, status);

INSERT INTO public.support_lounge_identities (user_id, nickname)
SELECT ids.user_id,
       COALESCE(n.nickname, m.nickname, d.from_nickname, 'Anonymous')
FROM (
  SELECT user_id FROM public.support_lounge_nicknames
  UNION SELECT user_id FROM public.support_lounge_messages
  UNION SELECT from_user_id FROM public.support_lounge_dms
  UNION SELECT to_user_id FROM public.support_lounge_dms
) ids
LEFT JOIN public.support_lounge_nicknames n ON n.user_id = ids.user_id
LEFT JOIN LATERAL (
  SELECT nickname FROM public.support_lounge_messages sm
  WHERE sm.user_id = ids.user_id ORDER BY sm.created_at DESC LIMIT 1
) m ON true
LEFT JOIN LATERAL (
  SELECT from_nickname FROM public.support_lounge_dms sd
  WHERE sd.from_user_id = ids.user_id ORDER BY sd.created_at DESC LIMIT 1
) d ON true
ON CONFLICT (user_id) DO UPDATE SET nickname = EXCLUDED.nickname, updated_at = now();

INSERT INTO public.support_lounge_messages_v2 (id, room, sender_lounge_id, nickname, content, created_at)
SELECT m.id, m.room, i.lounge_id, m.nickname, m.content, m.created_at
FROM public.support_lounge_messages m
JOIN public.support_lounge_identities i ON i.user_id = m.user_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.support_lounge_dms_v2 (id, from_lounge_id, to_lounge_id, from_nickname, content, credits_charged, created_at)
SELECT d.id, fi.lounge_id, ti.lounge_id, d.from_nickname, d.content, d.credits_charged, d.created_at
FROM public.support_lounge_dms d
JOIN public.support_lounge_identities fi ON fi.user_id = d.from_user_id
JOIN public.support_lounge_identities ti ON ti.user_id = d.to_user_id
ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON public.support_lounge_nicknames FROM authenticated;
REVOKE ALL ON public.support_lounge_passes FROM authenticated;
REVOKE ALL ON public.support_lounge_messages FROM authenticated;
REVOKE ALL ON public.support_lounge_dms FROM authenticated;
DROP POLICY IF EXISTS "Nicknames visible to members" ON public.support_lounge_nicknames;
DROP POLICY IF EXISTS "Users set own nickname" ON public.support_lounge_nicknames;
DROP POLICY IF EXISTS "Users update own nickname" ON public.support_lounge_nicknames;
DROP POLICY IF EXISTS "Users read own passes" ON public.support_lounge_passes;
DROP POLICY IF EXISTS "Members read room messages" ON public.support_lounge_messages;
DROP POLICY IF EXISTS "Members post own messages" ON public.support_lounge_messages;
DROP POLICY IF EXISTS "Participants can read their private messages" ON public.support_lounge_dms;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.support_lounge_messages;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.support_lounge_dms;
EXCEPTION WHEN undefined_object THEN NULL; END $$;