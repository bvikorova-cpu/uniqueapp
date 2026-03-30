-- Photo Gallery for Before/After community sharing
CREATE TABLE IF NOT EXISTS public.photo_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  before_url text NOT NULL,
  after_url text NOT NULL,
  title text NOT NULL,
  description text,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.photo_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery" ON public.photo_gallery FOR SELECT USING (true);
CREATE POLICY "Users can insert own gallery items" ON public.photo_gallery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can update gallery likes" ON public.photo_gallery FOR UPDATE USING (true);