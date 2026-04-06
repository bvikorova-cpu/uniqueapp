
CREATE TABLE public.ai_prompt_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  title TEXT,
  category TEXT DEFAULT 'general',
  is_favorite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts" ON public.ai_prompt_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own prompts" ON public.ai_prompt_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prompts" ON public.ai_prompt_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prompts" ON public.ai_prompt_history FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.ai_community_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  title TEXT,
  style TEXT,
  tool_used TEXT DEFAULT 'generate',
  likes_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_community_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public gallery" ON public.ai_community_gallery FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own gallery items" ON public.ai_community_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gallery items" ON public.ai_community_gallery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gallery items" ON public.ai_community_gallery FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.ai_gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gallery_item_id UUID NOT NULL REFERENCES public.ai_community_gallery(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, gallery_item_id)
);

ALTER TABLE public.ai_gallery_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.ai_gallery_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.ai_gallery_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.ai_gallery_likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_prompt_history_user ON public.ai_prompt_history(user_id);
CREATE INDEX idx_community_gallery_public ON public.ai_community_gallery(is_public, created_at DESC);
CREATE INDEX idx_gallery_likes_item ON public.ai_gallery_likes(gallery_item_id);
