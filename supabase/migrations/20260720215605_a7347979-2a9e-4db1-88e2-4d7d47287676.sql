
ALTER TABLE public.exclusive_proposals
  ADD COLUMN IF NOT EXISTS voting_closes_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days');

-- Ensure one vote per member per proposal
CREATE UNIQUE INDEX IF NOT EXISTS exclusive_proposal_votes_unique
  ON public.exclusive_proposal_votes (proposal_id, voter_id);

-- Remove ability to change or delete votes (one-and-final)
DROP POLICY IF EXISTS "Members update own vote" ON public.exclusive_proposal_votes;
DROP POLICY IF EXISTS "Members delete own vote" ON public.exclusive_proposal_votes;

-- Replace insert policy to enforce: open + not past deadline + no existing vote
DROP POLICY IF EXISTS "Members cast own vote" ON public.exclusive_proposal_votes;
CREATE POLICY "Members cast own vote"
  ON public.exclusive_proposal_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    voter_id = auth.uid()
    AND public.is_exclusive_member(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.exclusive_proposals p
      WHERE p.id = proposal_id
        AND p.status = 'open'
        AND p.voting_closes_at > now()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.exclusive_proposal_votes ev
      WHERE ev.proposal_id = proposal_id AND ev.voter_id = auth.uid()
    )
  );
