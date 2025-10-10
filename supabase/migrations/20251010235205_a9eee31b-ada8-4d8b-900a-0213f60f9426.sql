-- Insert additional popular tracks (expanding the library)
INSERT INTO public.tracks (title, artist, genre, bpm, duration, audio_url) VALUES
-- The Beatles
('Hey Jude', 'The Beatles', 'Rock', 76, '7:11', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Let It Be', 'The Beatles', 'Rock', 73, '3:50', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Come Together', 'The Beatles', 'Rock', 82, '4:20', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Yesterday', 'The Beatles', 'Rock', 96, '2:05', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),

-- Queen
('Bohemian Rhapsody', 'Queen', 'Rock', 72, '5:55', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('We Will Rock You', 'Queen', 'Rock', 81, '2:02', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('We Are The Champions', 'Queen', 'Rock', 63, '2:59', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Don''t Stop Me Now', 'Queen', 'Rock', 156, '3:29', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),

-- Elvis Presley
('Can''t Help Falling in Love', 'Elvis Presley', 'Rock', 86, '3:00', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),
('Hound Dog', 'Elvis Presley', 'Rock', 170, '2:16', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),
('Jailhouse Rock', 'Elvis Presley', 'Rock', 166, '2:27', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),

-- Adele
('Hello', 'Adele', 'Pop', 79, '4:55', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Someone Like You', 'Adele', 'Pop', 67, '4:45', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Rolling in the Deep', 'Adele', 'Pop', 105, '3:48', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),

-- Ed Sheeran
('Shape of You', 'Ed Sheeran', 'Pop', 96, '3:53', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Perfect', 'Ed Sheeran', 'Pop', 95, '4:23', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('Thinking Out Loud', 'Ed Sheeran', 'Pop', 79, '4:41', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),

-- Ariana Grande
('7 Rings', 'Ariana Grande', 'Pop', 140, '2:58', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),
('Thank U, Next', 'Ariana Grande', 'Pop', 107, '3:27', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),
('Break Free', 'Ariana Grande', 'Pop', 130, '3:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),

-- Bruno Mars
('Uptown Funk', 'Bruno Mars', 'Funk', 115, '4:30', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Just the Way You Are', 'Bruno Mars', 'Pop', 109, '3:40', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('24K Magic', 'Bruno Mars', 'Funk', 107, '3:46', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),

-- Coldplay
('Viva la Vida', 'Coldplay', 'Rock', 138, '4:01', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
('The Scientist', 'Coldplay', 'Rock', 146, '5:09', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Fix You', 'Coldplay', 'Rock', 138, '4:54', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),

-- Dua Lipa
('Levitating', 'Dua Lipa', 'Pop', 103, '3:23', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Don''t Start Now', 'Dua Lipa', 'Pop', 124, '3:03', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),
('New Rules', 'Dua Lipa', 'Pop', 116, '3:29', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),

-- The Weeknd
('Blinding Lights', 'The Weeknd', 'Pop', 171, '3:20', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3'),
('Starboy', 'The Weeknd', 'R&B', 186, '3:50', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Can''t Feel My Face', 'The Weeknd', 'Pop', 108, '3:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),

-- Taylor Swift
('Shake It Off', 'Taylor Swift', 'Pop', 160, '3:39', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Blank Space', 'Taylor Swift', 'Pop', 96, '3:51', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
('Love Story', 'Taylor Swift', 'Pop', 119, '3:55', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),

-- Katy Perry
('Roar', 'Katy Perry', 'Pop', 180, '3:42', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),
('Firework', 'Katy Perry', 'Pop', 124, '3:48', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Dark Horse', 'Katy Perry', 'Pop', 135, '3:35', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');