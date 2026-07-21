
-- InfluKing Weekly Challenges: definitions, participants, submissions
CREATE TABLE public.influking_weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'All',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy','Medium','Hard')),
  reward_credits INTEGER NOT NULL DEFAULT 50,
  reward_badge TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  participants_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.influking_weekly_challenges TO anon, authenticated;
GRANT ALL ON public.influking_weekly_challenges TO service_role;
ALTER TABLE public.influking_weekly_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weekly challenges readable by all"
  ON public.influking_weekly_challenges FOR SELECT USING (true);
CREATE POLICY "Admins manage weekly challenges"
  ON public.influking_weekly_challenges FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.influking_challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.influking_weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.influking_challenge_participants TO authenticated;
GRANT ALL ON public.influking_challenge_participants TO service_role;
ALTER TABLE public.influking_challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view own or aggregate"
  ON public.influking_challenge_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users join challenges"
  ON public.influking_challenge_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users leave own participation"
  ON public.influking_challenge_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.influking_challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.influking_weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_url TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reward_credits_granted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.influking_challenge_submissions TO authenticated;
GRANT ALL ON public.influking_challenge_submissions TO service_role;
ALTER TABLE public.influking_challenge_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own submissions"
  ON public.influking_challenge_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own submissions"
  ON public.influking_challenge_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update submissions"
  ON public.influking_challenge_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-count participants
CREATE OR REPLACE FUNCTION public.influking_update_challenge_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    UPDATE public.influking_weekly_challenges
       SET participants_count = participants_count + 1, updated_at = now()
     WHERE id = NEW.challenge_id;
  ELSIF TG_OP='DELETE' THEN
    UPDATE public.influking_weekly_challenges
       SET participants_count = GREATEST(0, participants_count - 1), updated_at = now()
     WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE TRIGGER trg_influking_challenge_count
AFTER INSERT OR DELETE ON public.influking_challenge_participants
FOR EACH ROW EXECUTE FUNCTION public.influking_update_challenge_count();

-- Updated_at triggers (reuse existing helper if present)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;

CREATE TRIGGER trg_influking_wc_updated
BEFORE UPDATE ON public.influking_weekly_challenges
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_influking_sub_updated
BEFORE UPDATE ON public.influking_challenge_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed 6 initial challenges (one-week window)
INSERT INTO public.influking_weekly_challenges
  (title, description, category, difficulty, reward_credits, reward_badge, ends_at) VALUES
  ('7-Day Consistency Sprint','Post content every single day for 7 days straight. Quality matters!','All','Medium',50,'Verified Boost', now() + interval '7 days'),
  ('Viral Reel Challenge','Create a reel that gets 1,000+ views in 48 hours. Use trending audio and hooks.','Video','Hard',100,'Featured Spot', now() + interval '5 days'),
  ('Engagement Booster','Get 50+ comments on a single post. Ask questions, create polls, be interactive!','Engagement','Easy',30,NULL, now() + interval '7 days'),
  ('Collab Creator','Partner with another influencer and create a joint post or video.','Collaboration','Medium',75,'Collab Badge', now() + interval '10 days'),
  ('Story Marathon','Post 20 stories in one day documenting your creative process.','Stories','Easy',40,NULL, now() + interval '4 days'),
  ('Trend Setter','Start a new trend or challenge that other influencers join. Most creative wins!','Trending','Hard',200,'Crown Badge', now() + interval '12 days');

CREATE INDEX idx_influking_wc_active_ends ON public.influking_weekly_challenges(is_active, ends_at DESC);
CREATE INDEX idx_influking_cp_user ON public.influking_challenge_participants(user_id);
CREATE INDEX idx_influking_cs_challenge_status ON public.influking_challenge_submissions(challenge_id, status);
