
CREATE TABLE public.dating_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  mode text NOT NULL DEFAULT 'mixer' CHECK (mode IN ('speed_dating','mixer','group_date','virtual')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  max_participants int,
  city text,
  cover_url text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_events TO authenticated;
GRANT ALL ON public.dating_events TO service_role;
ALTER TABLE public.dating_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_public" ON public.dating_events FOR SELECT TO authenticated USING (is_public OR host_id = auth.uid());
CREATE POLICY "events_insert_self" ON public.dating_events FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "events_update_host" ON public.dating_events FOR UPDATE TO authenticated USING (host_id = auth.uid()) WITH CHECK (host_id = auth.uid());
CREATE POLICY "events_delete_host" ON public.dating_events FOR DELETE TO authenticated USING (host_id = auth.uid());

CREATE TABLE public.dating_event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.dating_events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going','interested','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_event_participants TO authenticated;
GRANT ALL ON public.dating_event_participants TO service_role;
ALTER TABLE public.dating_event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ep_select" ON public.dating_event_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_events e WHERE e.id = event_id AND (e.host_id = auth.uid() OR e.is_public)));
CREATE POLICY "ep_insert_self" ON public.dating_event_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "ep_update_self" ON public.dating_event_participants FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "ep_delete_self" ON public.dating_event_participants FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.dating_friend_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_friend_circles TO authenticated;
GRANT ALL ON public.dating_friend_circles TO service_role;
ALTER TABLE public.dating_friend_circles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.dating_friend_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.dating_friend_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_friend_circle_members TO authenticated;
GRANT ALL ON public.dating_friend_circle_members TO service_role;
ALTER TABLE public.dating_friend_circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fc_select_member" ON public.dating_friend_circles FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_friend_circle_members m WHERE m.circle_id = id AND m.user_id = auth.uid()));
CREATE POLICY "fc_insert_owner" ON public.dating_friend_circles FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "fc_update_owner" ON public.dating_friend_circles FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "fc_delete_owner" ON public.dating_friend_circles FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "fcm_select" ON public.dating_friend_circle_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_friend_circles c WHERE c.id = circle_id AND c.owner_id = auth.uid()));
CREATE POLICY "fcm_insert_owner" ON public.dating_friend_circle_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.dating_friend_circles c WHERE c.id = circle_id AND c.owner_id = auth.uid()));
CREATE POLICY "fcm_delete" ON public.dating_friend_circle_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_friend_circles c WHERE c.id = circle_id AND c.owner_id = auth.uid()));

CREATE TABLE public.dating_group_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.dating_friend_circles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text NOT NULL,
  location text,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','done','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_group_activities TO authenticated;
GRANT ALL ON public.dating_group_activities TO service_role;
ALTER TABLE public.dating_group_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ga_select_member" ON public.dating_group_activities FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dating_friend_circles c WHERE c.id = circle_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_friend_circle_members m WHERE m.circle_id = c.id AND m.user_id = auth.uid()))));
CREATE POLICY "ga_insert_member" ON public.dating_group_activities FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM public.dating_friend_circles c WHERE c.id = circle_id AND (c.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.dating_friend_circle_members m WHERE m.circle_id = c.id AND m.user_id = auth.uid()))));
CREATE POLICY "ga_update_creator" ON public.dating_group_activities FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "ga_delete_creator" ON public.dating_group_activities FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE TABLE public.dating_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_polls TO authenticated;
GRANT ALL ON public.dating_polls TO service_role;
ALTER TABLE public.dating_polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dp_select_match" ON public.dating_polls FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dating_matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())));
CREATE POLICY "dp_insert_match" ON public.dating_polls FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.dating_matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())));
CREATE POLICY "dp_delete_author" ON public.dating_polls FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE TABLE public.dating_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.dating_polls(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL,
  option_index int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_poll_votes TO authenticated;
GRANT ALL ON public.dating_poll_votes TO service_role;
ALTER TABLE public.dating_poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dpv_select_match" ON public.dating_poll_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dating_polls p JOIN public.dating_matches m ON m.id = p.match_id WHERE p.id = poll_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())));
CREATE POLICY "dpv_insert_self" ON public.dating_poll_votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = auth.uid() AND EXISTS (SELECT 1 FROM public.dating_polls p JOIN public.dating_matches m ON m.id = p.match_id WHERE p.id = poll_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())));

CREATE OR REPLACE FUNCTION public.dating_events_touch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER dating_events_touch_t BEFORE UPDATE ON public.dating_events FOR EACH ROW EXECUTE FUNCTION public.dating_events_touch();

CREATE INDEX dating_events_starts_idx ON public.dating_events(starts_at DESC);
CREATE INDEX dating_ep_event_idx ON public.dating_event_participants(event_id);
CREATE INDEX dating_fcm_circle_idx ON public.dating_friend_circle_members(circle_id);
CREATE INDEX dating_ga_circle_idx ON public.dating_group_activities(circle_id);
CREATE INDEX dating_polls_match_idx ON public.dating_polls(match_id);
