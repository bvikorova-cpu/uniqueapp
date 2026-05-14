
-- =========================================
-- Phase 8: Family relationships
-- =========================================
CREATE TYPE public.family_relation_kind AS ENUM (
  'spouse', 'partner', 'parent', 'child', 'sibling',
  'grandparent', 'grandchild', 'cousin', 'in_law', 'other'
);

CREATE TABLE public.family_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_user_id UUID NOT NULL,
  kind public.family_relation_kind NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  requested_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT family_no_self CHECK (user_id <> related_user_id),
  CONSTRAINT family_unique UNIQUE (user_id, related_user_id, kind)
);

CREATE INDEX idx_family_user ON public.family_relationships(user_id);
CREATE INDEX idx_family_related ON public.family_relationships(related_user_id);

ALTER TABLE public.family_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View confirmed family or own pending"
ON public.family_relationships FOR SELECT
USING (
  status = 'confirmed'
  OR auth.uid() = user_id
  OR auth.uid() = related_user_id
);

CREATE POLICY "Users can request family ties"
ON public.family_relationships FOR INSERT
WITH CHECK (
  auth.uid() = requested_by
  AND requested_by IN (user_id, related_user_id)
);

CREATE POLICY "Both parties can update status"
ON public.family_relationships FOR UPDATE
USING (auth.uid() IN (user_id, related_user_id));

CREATE POLICY "Both parties can delete"
ON public.family_relationships FOR DELETE
USING (auth.uid() IN (user_id, related_user_id));

CREATE TRIGGER trg_family_updated
BEFORE UPDATE ON public.family_relationships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Phase 8: Life events
-- =========================================
CREATE TYPE public.life_event_kind AS ENUM (
  'new_job','promotion','retired','started_school','graduated',
  'moved','bought_home','engagement','marriage','baby',
  'new_pet','travel','milestone','other'
);

CREATE TABLE public.life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind public.life_event_kind NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE,
  cover_image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','friends','private')),
  post_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_life_events_user ON public.life_events(user_id);
CREATE INDEX idx_life_events_date ON public.life_events(event_date DESC);

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

-- Helper: are A and B friends?
CREATE OR REPLACE FUNCTION public.are_friends(a UUID, b UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((user_id = a AND friend_id = b) OR (user_id = b AND friend_id = a))
  );
$$;

CREATE POLICY "View life events by visibility"
ON public.life_events FOR SELECT
USING (
  visibility = 'public'
  OR auth.uid() = user_id
  OR (visibility = 'friends' AND public.are_friends(auth.uid(), user_id))
);

CREATE POLICY "Users can create their own life events"
ON public.life_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life events"
ON public.life_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life events"
ON public.life_events FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_life_events_updated
BEFORE UPDATE ON public.life_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Speed up friend suggestions
-- =========================================
CREATE INDEX IF NOT EXISTS idx_friendships_user_status
  ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status
  ON public.friendships(friend_id, status);

-- =========================================
-- People-you-may-know via mutual friends (security definer)
-- =========================================
CREATE OR REPLACE FUNCTION public.suggest_friends(_user_id UUID, _limit INT DEFAULT 10)
RETURNS TABLE(suggested_id UUID, mutual_count BIGINT)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH my_friends AS (
    SELECT CASE WHEN user_id = _user_id THEN friend_id ELSE user_id END AS fid
    FROM public.friendships
    WHERE status = 'accepted' AND (user_id = _user_id OR friend_id = _user_id)
  ),
  fof AS (
    SELECT
      CASE WHEN f.user_id = mf.fid THEN f.friend_id ELSE f.user_id END AS candidate
    FROM public.friendships f
    JOIN my_friends mf ON (f.user_id = mf.fid OR f.friend_id = mf.fid)
    WHERE f.status = 'accepted'
  )
  SELECT candidate AS suggested_id, COUNT(*) AS mutual_count
  FROM fof
  WHERE candidate <> _user_id
    AND candidate NOT IN (SELECT fid FROM my_friends)
    AND NOT EXISTS (
      SELECT 1 FROM public.friendships f2
      WHERE (f2.user_id = _user_id AND f2.friend_id = candidate)
         OR (f2.user_id = candidate AND f2.friend_id = _user_id)
    )
  GROUP BY candidate
  ORDER BY mutual_count DESC
  LIMIT _limit;
$$;
