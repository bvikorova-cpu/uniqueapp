-- Create kids_shows table
CREATE TABLE IF NOT EXISTS public.kids_shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  category TEXT NOT NULL,
  age_rating TEXT DEFAULT '3+',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kids_episodes table
CREATE TABLE IF NOT EXISTS public.kids_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.kids_shows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  episode_number INTEGER NOT NULL,
  season_number INTEGER DEFAULT 1,
  duration_minutes INTEGER,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kids_watch_history table
CREATE TABLE IF NOT EXISTS public.kids_watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.kids_episodes(id) ON DELETE CASCADE,
  watch_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

-- Create kids_favorites table
CREATE TABLE IF NOT EXISTS public.kids_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_id UUID NOT NULL REFERENCES public.kids_shows(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, show_id)
);

-- Enable RLS
ALTER TABLE public.kids_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kids_shows
CREATE POLICY "Anyone can view shows"
ON public.kids_shows FOR SELECT USING (true);

CREATE POLICY "Admins can manage shows"
ON public.kids_shows FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for kids_episodes
CREATE POLICY "Anyone can view episodes"
ON public.kids_episodes FOR SELECT USING (true);

CREATE POLICY "Admins can manage episodes"
ON public.kids_episodes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for kids_watch_history
CREATE POLICY "Users can view their own watch history"
ON public.kids_watch_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
ON public.kids_watch_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
ON public.kids_watch_history FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for kids_favorites
CREATE POLICY "Users can view their own favorites"
ON public.kids_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
ON public.kids_favorites FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_kids_episodes_show_id ON public.kids_episodes(show_id);
CREATE INDEX idx_kids_watch_history_user_id ON public.kids_watch_history(user_id);
CREATE INDEX idx_kids_watch_history_episode_id ON public.kids_watch_history(episode_id);
CREATE INDEX idx_kids_favorites_user_id ON public.kids_favorites(user_id);
CREATE INDEX idx_kids_favorites_show_id ON public.kids_favorites(show_id);

-- Insert sample shows and episodes
INSERT INTO public.kids_shows (title, description, category, thumbnail_url, cover_image_url, is_premium) VALUES
('Magical Adventures', 'Join our heroes on magical journeys through enchanted lands', 'Adventure', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200', false),
('Space Explorers', 'Discover the wonders of space with our brave astronauts', 'Science', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200', false),
('Ocean Friends', 'Dive deep into the ocean and meet amazing sea creatures', 'Nature', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200', true),
('Animal Kingdom', 'Learn about animals from around the world', 'Educational', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400', 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=1200', false),
('Music Time', 'Sing and dance with your favorite characters', 'Music', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200', false),
('Fairy Tales', 'Classic stories brought to life with beautiful animation', 'Fantasy', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200', true);

-- Get the show IDs for inserting episodes
DO $$
DECLARE
  magical_id UUID;
  space_id UUID;
  ocean_id UUID;
BEGIN
  SELECT id INTO magical_id FROM public.kids_shows WHERE title = 'Magical Adventures';
  SELECT id INTO space_id FROM public.kids_shows WHERE title = 'Space Explorers';
  SELECT id INTO ocean_id FROM public.kids_shows WHERE title = 'Ocean Friends';
  
  -- Insert episodes for Magical Adventures
  INSERT INTO public.kids_episodes (show_id, title, description, episode_number, season_number, duration_minutes, video_url, thumbnail_url) VALUES
  (magical_id, 'The Enchanted Forest', 'Our heroes discover a magical forest', 1, 1, 23, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400'),
  (magical_id, 'The Crystal Cave', 'A mysterious cave holds secrets', 2, 1, 22, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
  (magical_id, 'The Flying Castle', 'A castle appears in the sky', 3, 1, 24, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400');
  
  -- Insert episodes for Space Explorers
  INSERT INTO public.kids_episodes (show_id, title, description, episode_number, season_number, duration_minutes, video_url, thumbnail_url) VALUES
  (space_id, 'Journey to Mars', 'First mission to the red planet', 1, 1, 25, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400'),
  (space_id, 'The Moon Station', 'Life on the lunar base', 2, 1, 23, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1596397663461-76d7f3e8c81d?w=400');
  
  -- Insert episodes for Ocean Friends
  INSERT INTO public.kids_episodes (show_id, title, description, episode_number, season_number, duration_minutes, video_url, thumbnail_url, is_premium) VALUES
  (ocean_id, 'The Coral Kingdom', 'Exploring the coral reef', 1, 1, 24, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400', true),
  (ocean_id, 'Deep Sea Adventure', 'Diving into the deep ocean', 2, 1, 26, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', true);
END $$;