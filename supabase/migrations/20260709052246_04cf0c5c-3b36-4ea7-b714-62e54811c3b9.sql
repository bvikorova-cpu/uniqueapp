-- Cancel existing self-invites (invalid data)
UPDATE public.friend_quest_invites
   SET status = 'cancelled', responded_at = COALESCE(responded_at, now())
 WHERE from_user = to_user AND status = 'pending';

DELETE FROM public.friend_quest_invites
 WHERE from_user = to_user AND status <> 'pending' AND status <> 'cancelled';

-- Actually just remove all remaining self-rows since they are meaningless test data
DELETE FROM public.friend_quest_invites WHERE from_user = to_user;

ALTER TABLE public.friend_quest_invites
  ADD CONSTRAINT friend_quest_invites_no_self CHECK (from_user <> to_user);

CREATE UNIQUE INDEX IF NOT EXISTS uq_fqi_pending_unique
  ON public.friend_quest_invites (from_user, to_user, quest_type)
  WHERE status = 'pending';