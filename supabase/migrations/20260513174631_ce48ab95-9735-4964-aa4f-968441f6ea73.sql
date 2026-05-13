-- Phase 5: Communities & Moderation

-- Communities (subreddit-like)
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  icon_url TEXT,
  creator_id UUID NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_nsfw BOOLEAN NOT NULL DEFAULT false,
  member_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_creator ON public.communities(creator_id);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities viewable by all" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update own community" ON public.communities FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creator can delete own community" ON public.communities FOR DELETE USING (auth.uid() = creator_id);

-- Community rules
CREATE TABLE IF NOT EXISTS public.community_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_rules_community ON public.community_rules(community_id);

ALTER TABLE public.community_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rules viewable by all" ON public.community_rules FOR SELECT USING (true);
CREATE POLICY "Community creator manages rules" ON public.community_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.creator_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.creator_id = auth.uid())
);

-- Community moderators
CREATE TABLE IF NOT EXISTS public.community_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_moderators_community ON public.community_moderators(community_id);
CREATE INDEX IF NOT EXISTS idx_community_moderators_user ON public.community_moderators(user_id);

ALTER TABLE public.community_moderators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mods list viewable by all" ON public.community_moderators FOR SELECT USING (true);
CREATE POLICY "Creator manages mods" ON public.community_moderators FOR ALL USING (
  EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.creator_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.communities c WHERE c.id = community_id AND c.creator_id = auth.uid())
);

-- Security definer to check mod
CREATE OR REPLACE FUNCTION public.is_community_moderator(_community_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_moderators WHERE community_id = _community_id AND user_id = _user_id
    UNION
    SELECT 1 FROM public.communities WHERE id = _community_id AND creator_id = _user_id
  )
$$;

-- Community members + karma
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  karma INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by all" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.community_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Mods update karma" ON public.community_members FOR UPDATE USING (
  public.is_community_moderator(community_id, auth.uid())
);

-- Moderation queue
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  reporter_id UUID,
  reason TEXT,
  ai_severity TEXT,
  ai_categories TEXT[],
  ai_summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modqueue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_modqueue_community ON public.moderation_queue(community_id);

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters see own reports" ON public.moderation_queue FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Mods see community queue" ON public.moderation_queue FOR SELECT USING (
  community_id IS NOT NULL AND public.is_community_moderator(community_id, auth.uid())
);
CREATE POLICY "Anyone can report" ON public.moderation_queue FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);
CREATE POLICY "Mods update queue" ON public.moderation_queue FOR UPDATE USING (
  community_id IS NOT NULL AND public.is_community_moderator(community_id, auth.uid())
);

-- Community notes (crowdsourced fact-checks)
CREATE TABLE IF NOT EXISTS public.post_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  helpful_count INT NOT NULL DEFAULT 0,
  not_helpful_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_notes_post ON public.post_notes(post_id);

ALTER TABLE public.post_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes visible if approved or own" ON public.post_notes FOR SELECT USING (status = 'approved' OR auth.uid() = author_id);
CREATE POLICY "Authenticated create notes" ON public.post_notes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author can edit own pending" ON public.post_notes FOR UPDATE USING (auth.uid() = author_id AND status = 'pending');

-- Note votes
CREATE TABLE IF NOT EXISTS public.post_note_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.post_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(note_id, user_id)
);

ALTER TABLE public.post_note_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by all" ON public.post_note_votes FOR SELECT USING (true);
CREATE POLICY "Users vote once" ON public.post_note_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vote" ON public.post_note_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users remove own vote" ON public.post_note_votes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update note vote counts
CREATE OR REPLACE FUNCTION public.update_post_note_vote_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE public.post_notes SET helpful_count = helpful_count + 1 WHERE id = NEW.note_id;
    ELSE
      UPDATE public.post_notes SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.note_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE public.post_notes SET helpful_count = GREATEST(0, helpful_count - 1) WHERE id = OLD.note_id;
    ELSE
      UPDATE public.post_notes SET not_helpful_count = GREATEST(0, not_helpful_count - 1) WHERE id = OLD.note_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_note_votes ON public.post_note_votes;
CREATE TRIGGER trg_post_note_votes
AFTER INSERT OR DELETE ON public.post_note_votes
FOR EACH ROW EXECUTE FUNCTION public.update_post_note_vote_counts();

-- Auto approve notes when ratio of helpful is high
CREATE OR REPLACE FUNCTION public.auto_approve_post_note()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.helpful_count >= 5 AND NEW.helpful_count >= NEW.not_helpful_count * 2 AND NEW.status = 'pending' THEN
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_note ON public.post_notes;
CREATE TRIGGER trg_auto_approve_note
BEFORE UPDATE ON public.post_notes
FOR EACH ROW EXECUTE FUNCTION public.auto_approve_post_note();
