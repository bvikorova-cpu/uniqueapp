-- Collaboration rooms for CreativeForge
CREATE TABLE public.creative_forge_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  current_content TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.creative_forge_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.creative_forge_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'collaborator',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE public.creative_forge_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.creative_forge_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.creative_forge_cowriter_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  context TEXT DEFAULT '',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  credits_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.creative_forge_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_forge_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_forge_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_forge_cowriter_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function: is user a member of a room
CREATE OR REPLACE FUNCTION public.is_creative_room_member(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.creative_forge_rooms WHERE id = _room_id AND owner_id = _user_id
    UNION ALL
    SELECT 1 FROM public.creative_forge_room_members WHERE room_id = _room_id AND user_id = _user_id
  );
$$;

-- Rooms policies
CREATE POLICY "Users can view their rooms or public rooms"
  ON public.creative_forge_rooms FOR SELECT
  USING (owner_id = auth.uid() OR is_public = true OR public.is_creative_room_member(id, auth.uid()));

CREATE POLICY "Users can create their own rooms"
  ON public.creative_forge_rooms FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their rooms"
  ON public.creative_forge_rooms FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their rooms"
  ON public.creative_forge_rooms FOR DELETE
  USING (owner_id = auth.uid());

-- Members policies
CREATE POLICY "Members can view membership of their rooms"
  ON public.creative_forge_room_members FOR SELECT
  USING (public.is_creative_room_member(room_id, auth.uid()));

CREATE POLICY "Users can join rooms"
  ON public.creative_forge_room_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON public.creative_forge_room_members FOR DELETE
  USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Members can view room messages"
  ON public.creative_forge_room_messages FOR SELECT
  USING (public.is_creative_room_member(room_id, auth.uid()));

CREATE POLICY "Members can post messages"
  ON public.creative_forge_room_messages FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_creative_room_member(room_id, auth.uid()));

-- Co-writer sessions policies
CREATE POLICY "Users manage their cowriter sessions"
  ON public.creative_forge_cowriter_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_creative_forge_rooms_updated_at
  BEFORE UPDATE ON public.creative_forge_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_forge_cowriter_sessions_updated_at
  BEFORE UPDATE ON public.creative_forge_cowriter_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();