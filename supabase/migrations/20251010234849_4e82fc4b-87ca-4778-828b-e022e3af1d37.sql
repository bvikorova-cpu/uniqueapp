-- Create tracks table for DJ music library
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  bpm INTEGER NOT NULL,
  duration TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view tracks)
CREATE POLICY "Tracks are viewable by everyone" 
ON public.tracks 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert tracks
CREATE POLICY "Authenticated users can insert tracks" 
ON public.tracks 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create index for faster filtering by genre
CREATE INDEX idx_tracks_genre ON public.tracks(genre);

-- Create index for faster filtering by artist
CREATE INDEX idx_tracks_artist ON public.tracks(artist);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tracks_updated_at
BEFORE UPDATE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial tracks data
INSERT INTO public.tracks (title, artist, genre, bpm, duration, audio_url) VALUES
-- Boney M
('Daddy Cool', 'Boney M', 'Disco', 128, '3:28', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Rasputin', 'Boney M', 'Disco', 126, '4:28', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Ma Baker', 'Boney M', 'Disco', 125, '4:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Rivers of Babylon', 'Boney M', 'Disco', 90, '4:19', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),

-- ABBA
('Dancing Queen', 'ABBA', 'Pop', 100, '3:51', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Mamma Mia', 'ABBA', 'Pop', 138, '3:32', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('Gimme! Gimme! Gimme!', 'ABBA', 'Pop', 120, '4:50', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Waterloo', 'ABBA', 'Pop', 145, '2:43', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),
('Take a Chance on Me', 'ABBA', 'Pop', 102, '4:05', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),

-- Destiny''s Child
('Survivor', 'Destiny''s Child', 'R&B', 138, '4:03', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),
('Bootylicious', 'Destiny''s Child', 'R&B', 102, '3:28', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Say My Name', 'Destiny''s Child', 'R&B', 95, '4:31', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Independent Women', 'Destiny''s Child', 'R&B', 95, '3:40', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),

-- Madonna
('Like a Prayer', 'Madonna', 'Pop', 112, '5:43', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
('Vogue', 'Madonna', 'Pop', 116, '4:48', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Material Girl', 'Madonna', 'Pop', 138, '4:00', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('Hung Up', 'Madonna', 'Pop', 120, '5:36', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Like a Virgin', 'Madonna', 'Pop', 118, '3:38', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),

-- Selena Gomez
('Come & Get It', 'Selena Gomez', 'Pop', 95, '3:50', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),
('Lose You to Love Me', 'Selena Gomez', 'Pop', 72, '3:26', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),
('Good for You', 'Selena Gomez', 'Pop', 82, '3:41', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Hands to Myself', 'Selena Gomez', 'Pop', 96, '3:20', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),

-- Beyoncé
('Crazy in Love', 'Beyoncé', 'R&B', 99, '3:56', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Single Ladies', 'Beyoncé', 'R&B', 193, '3:13', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
('Halo', 'Beyoncé', 'R&B', 84, '4:21', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),

-- Michael Jackson
('Billie Jean', 'Michael Jackson', 'Pop', 117, '4:54', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('Thriller', 'Michael Jackson', 'Pop', 118, '5:57', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Beat It', 'Michael Jackson', 'Pop', 139, '4:18', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),

-- Whitney Houston
('I Will Always Love You', 'Whitney Houston', 'Pop', 67, '4:31', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),
('I Wanna Dance with Somebody', 'Whitney Houston', 'Pop', 120, '4:51', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),

-- Rihanna
('Umbrella', 'Rihanna', 'Pop', 88, '4:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('We Found Love', 'Rihanna', 'Pop', 128, '3:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Diamonds', 'Rihanna', 'Pop', 92, '3:45', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),

-- Lady Gaga
('Bad Romance', 'Lady Gaga', 'Pop', 119, '4:54', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
('Poker Face', 'Lady Gaga', 'Pop', 120, '3:57', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Shallow', 'Lady Gaga', 'Pop', 96, '3:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3');