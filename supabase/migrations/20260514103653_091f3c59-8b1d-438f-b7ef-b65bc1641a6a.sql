-- Helper: is the user admin or moderator of the group?
CREATE OR REPLACE FUNCTION public.is_group_staff(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id
      AND user_id  = _user_id
      AND role IN ('admin','moderator')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_group_staff(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_staff(uuid, uuid) TO authenticated;

-- ==========================
-- group_rules
-- ==========================
CREATE TABLE IF NOT EXISTS public.group_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_rules_group ON public.group_rules(group_id, position);

ALTER TABLE public.group_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view group rules" ON public.group_rules;
CREATE POLICY "Anyone can view group rules"
  ON public.group_rules FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Group staff can insert rules" ON public.group_rules;
CREATE POLICY "Group staff can insert rules"
  ON public.group_rules FOR INSERT TO authenticated
  WITH CHECK (public.is_group_staff(group_id, auth.uid()) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Group staff can update rules" ON public.group_rules;
CREATE POLICY "Group staff can update rules"
  ON public.group_rules FOR UPDATE TO authenticated
  USING (public.is_group_staff(group_id, auth.uid()))
  WITH CHECK (public.is_group_staff(group_id, auth.uid()));

DROP POLICY IF EXISTS "Group staff can delete rules" ON public.group_rules;
CREATE POLICY "Group staff can delete rules"
  ON public.group_rules FOR DELETE TO authenticated
  USING (public.is_group_staff(group_id, auth.uid()));

CREATE OR REPLACE TRIGGER trg_group_rules_updated
BEFORE UPDATE ON public.group_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================
-- group_insights_daily
-- ==========================
CREATE TABLE IF NOT EXISTS public.group_insights_daily (
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  day date NOT NULL,
  new_members int NOT NULL DEFAULT 0,
  posts_count int NOT NULL DEFAULT 0,
  comments_count int NOT NULL DEFAULT 0,
  active_members int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, day)
);

CREATE INDEX IF NOT EXISTS idx_group_insights_day ON public.group_insights_daily(day DESC);

ALTER TABLE public.group_insights_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group staff can view insights" ON public.group_insights_daily;
CREATE POLICY "Group staff can view insights"
  ON public.group_insights_daily FOR SELECT TO authenticated
  USING (public.is_group_staff(group_id, auth.uid()));

-- Aggregator: writes one row per group for the requested day
CREATE OR REPLACE FUNCTION public.aggregate_group_insights(_day date DEFAULT (now() AT TIME ZONE 'UTC')::date)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected int;
BEGIN
  WITH new_members AS (
    SELECT group_id, COUNT(*)::int AS c
    FROM public.group_members
    WHERE joined_at::date = _day
    GROUP BY group_id
  ),
  new_posts AS (
    SELECT g.id AS group_id, COUNT(p.id)::int AS c
    FROM public.groups g
    LEFT JOIN public.posts p ON p.group_id = g.id
                            AND p.created_at::date = _day
    GROUP BY g.id
  ),
  active AS (
    SELECT g.id AS group_id, COUNT(DISTINCT p.user_id)::int AS c
    FROM public.groups g
    LEFT JOIN public.posts p ON p.group_id = g.id
                            AND p.created_at::date = _day
    GROUP BY g.id
  )
  INSERT INTO public.group_insights_daily
    (group_id, day, new_members, posts_count, comments_count, active_members)
  SELECT
    g.id, _day,
    COALESCE(nm.c, 0),
    COALESCE(np.c, 0),
    0,
    COALESCE(a.c, 0)
  FROM public.groups g
  LEFT JOIN new_members nm ON nm.group_id = g.id
  LEFT JOIN new_posts   np ON np.group_id = g.id
  LEFT JOIN active      a  ON a.group_id  = g.id
  ON CONFLICT (group_id, day) DO UPDATE SET
    new_members    = EXCLUDED.new_members,
    posts_count    = EXCLUDED.posts_count,
    active_members = EXCLUDED.active_members;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.aggregate_group_insights(date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aggregate_group_insights(date) TO authenticated, service_role;