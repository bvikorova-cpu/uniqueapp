CREATE TABLE IF NOT EXISTS public.beauty_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'makeup',
  likes_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.beauty_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public gallery" ON public.beauty_gallery FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own gallery" ON public.beauty_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gallery" ON public.beauty_gallery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own gallery" ON public.beauty_gallery FOR DELETE USING (auth.uid() = user_id);