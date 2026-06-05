-- Auto-sync denormalized counters: groups.members_count and pages.follower_count.
-- Initial backfill + triggers on INSERT/DELETE so client-side stale counters stop diverging.

UPDATE public.groups g
SET members_count = COALESCE((SELECT COUNT(*) FROM public.group_members gm WHERE gm.group_id = g.id), 0);

UPDATE public.pages p
SET follower_count = COALESCE((SELECT COUNT(*) FROM public.page_followers pf WHERE pf.page_id = p.id), 0);

CREATE OR REPLACE FUNCTION public.sync_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups SET members_count = COALESCE(members_count,0) + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups SET members_count = GREATEST(COALESCE(members_count,0) - 1, 0) WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_members_count ON public.group_members;
CREATE TRIGGER trg_group_members_count
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.sync_group_members_count();

CREATE OR REPLACE FUNCTION public.sync_page_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pages SET follower_count = COALESCE(follower_count,0) + 1 WHERE id = NEW.page_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pages SET follower_count = GREATEST(COALESCE(follower_count,0) - 1, 0) WHERE id = OLD.page_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_page_followers_count ON public.page_followers;
CREATE TRIGGER trg_page_followers_count
AFTER INSERT OR DELETE ON public.page_followers
FOR EACH ROW EXECUTE FUNCTION public.sync_page_followers_count();