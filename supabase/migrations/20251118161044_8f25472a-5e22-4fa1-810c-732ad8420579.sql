-- Create video_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS public.video_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(video_id, user_id)
);

ALTER TABLE public.video_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view video reactions" ON public.video_reactions;
CREATE POLICY "Anyone can view video reactions" ON public.video_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reactions" ON public.video_reactions;
CREATE POLICY "Users can insert their own reactions" ON public.video_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions" ON public.video_reactions;
CREATE POLICY "Users can update their own reactions" ON public.video_reactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.video_reactions;
CREATE POLICY "Users can delete their own reactions" ON public.video_reactions FOR DELETE USING (auth.uid() = user_id);

-- Create video_views table
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  UNIQUE(video_id, user_id)
);

ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view video views" ON public.video_views;
CREATE POLICY "Anyone can view video views" ON public.video_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert video views" ON public.video_views;
CREATE POLICY "Anyone can insert video views" ON public.video_views FOR INSERT WITH CHECK (true);

-- Create function to update views count
CREATE OR REPLACE FUNCTION public.update_video_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.videos SET views_count = views_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_video_views_count_trigger ON public.video_views;
CREATE TRIGGER update_video_views_count_trigger
  AFTER INSERT ON public.video_views
  FOR EACH ROW EXECUTE FUNCTION public.update_video_views_count();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_video_reactions_video_id ON public.video_reactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);