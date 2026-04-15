
-- Community Gallery for sharing colored pages
CREATE TABLE public.coloring_community_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  likes_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  tool_used TEXT DEFAULT 'coloring-studio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_community_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public gallery" ON public.coloring_community_gallery FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create gallery items" ON public.coloring_community_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gallery items" ON public.coloring_community_gallery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gallery items" ON public.coloring_community_gallery FOR DELETE USING (auth.uid() = user_id);

-- Gallery likes
CREATE TABLE public.coloring_gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gallery_item_id UUID NOT NULL REFERENCES public.coloring_community_gallery(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, gallery_item_id)
);
ALTER TABLE public.coloring_gallery_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.coloring_gallery_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.coloring_gallery_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.coloring_gallery_likes FOR DELETE USING (auth.uid() = user_id);

-- Daily Coloring Challenges
CREATE TABLE public.coloring_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  prompt TEXT NOT NULL,
  sample_image_url TEXT,
  xp_reward INTEGER DEFAULT 50,
  participants_count INTEGER DEFAULT 0,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_date)
);
ALTER TABLE public.coloring_daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON public.coloring_daily_challenges FOR SELECT USING (true);

-- Challenge submissions
CREATE TABLE public.coloring_challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.coloring_daily_challenges(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  completion_time_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.coloring_challenge_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view submissions" ON public.coloring_challenge_submissions FOR SELECT USING (true);
CREATE POLICY "Users can submit" ON public.coloring_challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own" ON public.coloring_challenge_submissions FOR UPDATE USING (auth.uid() = user_id);

-- AI Color Suggestions
CREATE TABLE public.coloring_color_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_image_url TEXT NOT NULL,
  palette JSONB NOT NULL DEFAULT '[]',
  style TEXT DEFAULT 'vibrant',
  ai_description TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_color_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own suggestions" ON public.coloring_color_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create suggestions" ON public.coloring_color_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own" ON public.coloring_color_suggestions FOR DELETE USING (auth.uid() = user_id);
