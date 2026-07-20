
CREATE OR REPLACE FUNCTION public.is_exclusive_member(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.exclusive_members
    WHERE user_id = _uid AND status = 'active'
  )
$$;

CREATE TABLE public.exclusive_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','vetoed','implemented')),
  owner_note text,
  decided_at timestamptz,
  decided_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_proposals TO authenticated;
GRANT ALL ON public.exclusive_proposals TO service_role;
ALTER TABLE public.exclusive_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read proposals" ON public.exclusive_proposals
FOR SELECT TO authenticated
USING (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Members create proposals" ON public.exclusive_proposals
FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid() AND public.is_exclusive_member(auth.uid()));

CREATE POLICY "Author edits own open proposal" ON public.exclusive_proposals
FOR UPDATE TO authenticated
USING (author_id = auth.uid() AND status = 'open')
WITH CHECK (author_id = auth.uid() AND status = 'open');

CREATE POLICY "Admin decides proposals" ON public.exclusive_proposals
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'))
WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Author deletes own open proposal" ON public.exclusive_proposals
FOR DELETE TO authenticated
USING (author_id = auth.uid() AND status = 'open');

CREATE TABLE public.exclusive_proposal_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.exclusive_proposals(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL,
  vote smallint NOT NULL CHECK (vote IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, voter_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_proposal_votes TO authenticated;
GRANT ALL ON public.exclusive_proposal_votes TO service_role;
ALTER TABLE public.exclusive_proposal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read votes" ON public.exclusive_proposal_votes
FOR SELECT TO authenticated
USING (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Members cast own vote" ON public.exclusive_proposal_votes
FOR INSERT TO authenticated
WITH CHECK (voter_id = auth.uid() AND public.is_exclusive_member(auth.uid()));

CREATE POLICY "Members update own vote" ON public.exclusive_proposal_votes
FOR UPDATE TO authenticated
USING (voter_id = auth.uid())
WITH CHECK (voter_id = auth.uid());

CREATE POLICY "Members delete own vote" ON public.exclusive_proposal_votes
FOR DELETE TO authenticated
USING (voter_id = auth.uid());

CREATE INDEX idx_excl_prop_status_created ON public.exclusive_proposals(status, created_at DESC);
CREATE INDEX idx_excl_prop_votes_proposal ON public.exclusive_proposal_votes(proposal_id);

CREATE TRIGGER trg_excl_prop_updated BEFORE UPDATE ON public.exclusive_proposals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
