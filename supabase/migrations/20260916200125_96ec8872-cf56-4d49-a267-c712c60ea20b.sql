-- 1) Remove duplicate notification triggers (keep the richest one per event)
DROP TRIGGER IF EXISTS on_forum_comment_notify ON public.forum_comments;
DROP TRIGGER IF EXISTS trg_notify_forum_comment ON public.forum_comments;
DROP TRIGGER IF EXISTS trg_notify_forum_post_like ON public.forum_post_likes;
DROP TRIGGER IF EXISTS notify_employer_on_new_application ON public.job_applications;
DROP TRIGGER IF EXISTS trg_notify_applicant_on_status_change ON public.job_applications;
DROP TRIGGER IF EXISTS trg_notify_skill_message ON public.marketplace_responses;
DROP TRIGGER IF EXISTS notify_admin_on_musician_withdrawal ON public.musician_withdrawal_requests;
DROP TRIGGER IF EXISTS trigger_notify_repost ON public.reposts;

-- 2) Global de-duplication guard for notifications
CREATE OR REPLACE FUNCTION public.dedupe_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = NEW.user_id
      AND n.created_at > now() - interval '60 seconds'
      AND COALESCE(n.type,'') = COALESCE(NEW.type,'')
      AND COALESCE(n.actor_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(NEW.actor_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(n.related_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(NEW.related_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(n.post_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(NEW.post_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(n.comment_id, '00000000-0000-0000-0000-000000000000'::uuid)
          = COALESCE(NEW.comment_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(n.message,'') = COALESCE(NEW.message,'')
  ) THEN
    RETURN NULL; -- skip duplicate
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dedupe_notification ON public.notifications;
CREATE TRIGGER trg_dedupe_notification
BEFORE INSERT ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.dedupe_notification();

CREATE INDEX IF NOT EXISTS idx_notifications_dedupe
  ON public.notifications (user_id, type, created_at DESC);