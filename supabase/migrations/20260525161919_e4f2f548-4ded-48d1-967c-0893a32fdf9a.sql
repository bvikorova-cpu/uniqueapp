-- 1) Trigger function to keep groups.members_count in sync
CREATE OR REPLACE FUNCTION public.sync_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups
       SET members_count = COALESCE(members_count, 0) + 1,
           updated_at = now()
     WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups
       SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0),
           updated_at = now()
     WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_members_count_ins ON public.group_members;
DROP TRIGGER IF EXISTS trg_group_members_count_del ON public.group_members;

CREATE TRIGGER trg_group_members_count_ins
AFTER INSERT ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.sync_group_members_count();

CREATE TRIGGER trg_group_members_count_del
AFTER DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.sync_group_members_count();

-- 2) Backfill existing members_count
UPDATE public.groups g
   SET members_count = sub.cnt
  FROM (
    SELECT group_id, COUNT(*)::int AS cnt
      FROM public.group_members
     GROUP BY group_id
  ) sub
 WHERE g.id = sub.group_id
   AND g.members_count IS DISTINCT FROM sub.cnt;

UPDATE public.groups
   SET members_count = 0
 WHERE members_count IS NULL
    OR id NOT IN (SELECT DISTINCT group_id FROM public.group_members);

-- 3) Cleanup orphan test group
DELETE FROM public.groups WHERE name = 'Test Wall QA Group';