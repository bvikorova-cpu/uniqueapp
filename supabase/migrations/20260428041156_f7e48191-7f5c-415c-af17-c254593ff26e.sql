
-- Add vote_type to talent_votes (like/dislike)
DO $$ BEGIN
  CREATE TYPE public.talent_vote_type AS ENUM ('like','dislike');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.talent_votes
  ADD COLUMN IF NOT EXISTS vote_type public.talent_vote_type NOT NULL DEFAULT 'like';

-- Ensure one vote per user per submission
DO $$ BEGIN
  ALTER TABLE public.talent_votes
    ADD CONSTRAINT talent_votes_user_submission_unique UNIQUE (user_id, submission_id);
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN duplicate_table THEN NULL; END $$;

-- Add dislikes_count to submissions
ALTER TABLE public.talent_submissions
  ADD COLUMN IF NOT EXISTS dislikes_count integer NOT NULL DEFAULT 0;

-- Trigger function to keep counts in sync
CREATE OR REPLACE FUNCTION public.tg_talent_votes_sync_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'like' THEN
      UPDATE public.talent_submissions SET votes_count = COALESCE(votes_count,0) + 1 WHERE id = NEW.submission_id;
    ELSE
      UPDATE public.talent_submissions SET dislikes_count = COALESCE(dislikes_count,0) + 1 WHERE id = NEW.submission_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'like' THEN
      UPDATE public.talent_submissions SET votes_count = GREATEST(COALESCE(votes_count,0) - 1, 0) WHERE id = OLD.submission_id;
    ELSE
      UPDATE public.talent_submissions SET dislikes_count = GREATEST(COALESCE(dislikes_count,0) - 1, 0) WHERE id = OLD.submission_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type IS DISTINCT FROM NEW.vote_type THEN
      IF OLD.vote_type = 'like' THEN
        UPDATE public.talent_submissions SET votes_count = GREATEST(COALESCE(votes_count,0) - 1, 0) WHERE id = NEW.submission_id;
      ELSE
        UPDATE public.talent_submissions SET dislikes_count = GREATEST(COALESCE(dislikes_count,0) - 1, 0) WHERE id = NEW.submission_id;
      END IF;
      IF NEW.vote_type = 'like' THEN
        UPDATE public.talent_submissions SET votes_count = COALESCE(votes_count,0) + 1 WHERE id = NEW.submission_id;
      ELSE
        UPDATE public.talent_submissions SET dislikes_count = COALESCE(dislikes_count,0) + 1 WHERE id = NEW.submission_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.tg_talent_votes_sync_counts() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS talent_votes_sync_counts_ins ON public.talent_votes;
DROP TRIGGER IF EXISTS talent_votes_sync_counts_upd ON public.talent_votes;
DROP TRIGGER IF EXISTS talent_votes_sync_counts_del ON public.talent_votes;

CREATE TRIGGER talent_votes_sync_counts_ins
AFTER INSERT ON public.talent_votes
FOR EACH ROW EXECUTE FUNCTION public.tg_talent_votes_sync_counts();

CREATE TRIGGER talent_votes_sync_counts_upd
AFTER UPDATE OF vote_type ON public.talent_votes
FOR EACH ROW EXECUTE FUNCTION public.tg_talent_votes_sync_counts();

CREATE TRIGGER talent_votes_sync_counts_del
AFTER DELETE ON public.talent_votes
FOR EACH ROW EXECUTE FUNCTION public.tg_talent_votes_sync_counts();

-- Backfill: recompute counts from existing votes (assume existing rows are likes)
UPDATE public.talent_submissions s SET
  votes_count = COALESCE((SELECT COUNT(*) FROM public.talent_votes v WHERE v.submission_id = s.id AND v.vote_type = 'like'),0),
  dislikes_count = COALESCE((SELECT COUNT(*) FROM public.talent_votes v WHERE v.submission_id = s.id AND v.vote_type = 'dislike'),0);
