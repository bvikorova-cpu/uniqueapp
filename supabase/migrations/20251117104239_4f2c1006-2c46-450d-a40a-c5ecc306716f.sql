-- Update existing concerts to 2026 and add 14+ more legendary artists
DELETE FROM public.holographic_concerts;

-- Insert 18 legendary holographic concerts for 2026
INSERT INTO public.holographic_concerts (title, artist_name, description, concert_date, duration_minutes, thumbnail_url, video_url, is_live) VALUES
-- January 2026
('Bohemian Rhapsody: The Legend Returns', 'Freddie Mercury', 'Experience the unmatched charisma and vocals of Queen''s legendary frontman in a stunning holographic performance', '2026-01-15 20:00:00+00', 120, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('The King of Rock Lives Again', 'Elvis Presley', 'The King returns with his iconic hip-swiveling moves and timeless hits in revolutionary holographic form', '2026-01-22 21:00:00+00', 90, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- February 2026
('Moonwalk Through Time', 'Michael Jackson', 'The King of Pop''s greatest performances recreated with cutting-edge AI holographic technology', '2026-02-05 19:30:00+00', 150, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('I Will Always Love You: Whitney''s Voice Lives On', 'Whitney Houston', 'The most powerful voice in music history returns in an emotional holographic tribute', '2026-02-14 20:00:00+00', 100, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- March 2026
('Starman Returns: David Bowie Holographic Experience', 'David Bowie', 'The Starman descends once more with his groundbreaking artistry and theatrical performances', '2026-03-10 21:00:00+00', 135, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Back to Black: Amy Winehouse Holographic Concert', 'Amy Winehouse', 'The soulful voice that defined a generation returns with her unforgettable classics', '2026-03-20 19:00:00+00', 85, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- April 2026
('Purple Rain Forever: Prince Holographic Show', 'Prince', 'The Purple One returns with his electrifying guitar solos and unmatched stage presence', '2026-04-07 20:30:00+00', 140, 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Smells Like Teen Spirit: Kurt Cobain Holographic Concert', 'Kurt Cobain', 'Nirvana''s legendary frontman returns with grunge''s most iconic anthems', '2026-04-21 21:00:00+00', 95, 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- May 2026
('Light My Fire: Jim Morrison & The Doors', 'Jim Morrison', 'The Lizard King returns with The Doors'' psychedelic rock masterpieces', '2026-05-08 20:00:00+00', 110, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Piece of My Heart: Janis Joplin Live', 'Janis Joplin', 'Rock''s most powerful female voice returns in a raw, emotional holographic performance', '2026-05-25 19:30:00+00', 90, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- June 2026
('One Love: Bob Marley Holographic Jammin''', 'Bob Marley', 'The reggae legend returns with his message of peace, love, and revolutionary music', '2026-06-10 21:00:00+00', 125, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Imagine: John Lennon Holographic Tribute', 'John Lennon', 'The Beatles legend returns with his timeless messages of peace and hope', '2026-06-20 20:00:00+00', 105, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- July 2026
('All Eyez on Me: 2Pac Holographic Experience', 'Tupac Shakur', 'The legendary rapper returns with his powerful lyrics and unforgettable performances', '2026-07-04 22:00:00+00', 115, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Notorious: Biggie Smalls Holographic Concert', 'The Notorious B.I.G.', 'Brooklyn''s finest returns with East Coast hip-hop''s greatest hits', '2026-07-18 21:30:00+00', 100, 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- August 2026
('My Way: Frank Sinatra Holographic Night', 'Frank Sinatra', 'Ol'' Blue Eyes returns with timeless classics from the golden age of music', '2026-08-01 20:00:00+00', 120, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('Respect: Aretha Franklin - Queen of Soul', 'Aretha Franklin', 'The Queen of Soul returns with her incomparable voice and groundbreaking performances', '2026-08-15 19:30:00+00', 110, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

-- September 2026
('Purple Haze: Jimi Hendrix Holographic Guitar Experience', 'Jimi Hendrix', 'The greatest guitarist ever returns with his revolutionary sound and legendary performances', '2026-09-05 21:00:00+00', 130, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false),

('The Man in Black Returns: Johnny Cash', 'Johnny Cash', 'Country music''s legendary outlaw returns with his deep voice and timeless storytelling', '2026-09-20 20:00:00+00', 105, 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', false);