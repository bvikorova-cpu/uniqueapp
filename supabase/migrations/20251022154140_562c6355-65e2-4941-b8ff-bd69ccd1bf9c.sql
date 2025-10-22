-- Add episodes for Disney/Pixar movies

-- Frozen episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Elsa and Anna Best Sister Moments', '50 minút najlepších chvíľ sestier', 1, 1, 50, 'https://www.youtube.com/watch?v=pe-tlWn5Q-o', 'https://img.youtube.com/vi/pe-tlWn5Q-o/maxresdefault.jpg', false, 8900
FROM kids_shows WHERE title = 'Frozen Stories';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Frozen 2 - All Clips', 'Všetky scény z Frozen 2', 1, 2, 35, 'https://www.youtube.com/watch?v=kxQx1swsvHU', 'https://img.youtube.com/vi/kxQx1swsvHU/maxresdefault.jpg', false, 7200
FROM kids_shows WHERE title = 'Frozen Stories';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Best of Elsa and Anna Magical Moments', 'Hodina čarovných momentov', 1, 3, 60, 'https://www.youtube.com/watch?v=ekFm9Y-lsAc', 'https://img.youtube.com/vi/ekFm9Y-lsAc/maxresdefault.jpg', false, 9500
FROM kids_shows WHERE title = 'Frozen Stories';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Elsa & Anna Snow Scenes', 'Najlepšie snehové scény', 1, 4, 25, 'https://www.youtube.com/watch?v=WKaIjiGrpfY', 'https://img.youtube.com/vi/WKaIjiGrpfY/maxresdefault.jpg', false, 11200
FROM kids_shows WHERE title = 'Frozen Stories';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Frozen - All Movie Clips', 'Kompletné scény z Frozen', 1, 5, 40, 'https://www.youtube.com/watch?v=HGQteARDmC0', 'https://img.youtube.com/vi/HGQteARDmC0/maxresdefault.jpg', true, 8700
FROM kids_shows WHERE title = 'Frozen Stories';

-- Moana episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Moana - All Movie Clips', 'Všetky scény z Moany', 1, 1, 45, 'https://www.youtube.com/watch?v=rcxNq4tVqyQ', 'https://img.youtube.com/vi/rcxNq4tVqyQ/maxresdefault.jpg', false, 7800
FROM kids_shows WHERE title = 'Moana';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Moana 2 - All Movie Clips', 'Nové dobrodružstvo Moany', 1, 2, 38, 'https://www.youtube.com/watch?v=k3KZ3cp2gEY', 'https://img.youtube.com/vi/k3KZ3cp2gEY/maxresdefault.jpg', false, 6900
FROM kids_shows WHERE title = 'Moana';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Moana 2 - Rule Number Scene', 'Nová pieseň z Moana 2', 1, 3, 8, 'https://www.youtube.com/watch?v=_VxF1_eZc64', 'https://img.youtube.com/vi/_VxF1_eZc64/maxresdefault.jpg', false, 5200
FROM kids_shows WHERE title = 'Moana';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Moana 2 - Chee-Hoo Song', 'Moana a Maui spievajú', 1, 4, 5, 'https://www.youtube.com/watch?v=z2OTShVK_F4', 'https://img.youtube.com/vi/z2OTShVK_F4/maxresdefault.jpg', false, 6100
FROM kids_shows WHERE title = 'Moana';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Moana 2 - You Need A Crew', 'Moana potrebuje tím', 1, 5, 7, 'https://www.youtube.com/watch?v=CxJghS8GK-4', 'https://img.youtube.com/vi/CxJghS8GK-4/maxresdefault.jpg', false, 4800
FROM kids_shows WHERE title = 'Moana';

-- Finding Nemo episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Finding Nemo - All Clips', 'Všetky scény z Finding Nemo', 1, 1, 35, 'https://www.youtube.com/watch?v=gAN6xSqS7_E', 'https://img.youtube.com/vi/gAN6xSqS7_E/maxresdefault.jpg', false, 6700
FROM kids_shows WHERE title = 'Finding Nemo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Finding Dory - All Clips', 'Všetky scény z Finding Dory', 1, 2, 32, 'https://www.youtube.com/watch?v=UZP0zsa9SkA', 'https://img.youtube.com/vi/UZP0zsa9SkA/maxresdefault.jpg', false, 5900
FROM kids_shows WHERE title = 'Finding Nemo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Finding Dory - Full Story', 'Celý príbeh Finding Dory', 1, 3, 48, 'https://www.youtube.com/watch?v=H9iv9A3rdl8', 'https://img.youtube.com/vi/H9iv9A3rdl8/maxresdefault.jpg', false, 7200
FROM kids_shows WHERE title = 'Finding Nemo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Dory Remembers Nemo', 'Dory si spomína na Nema', 1, 4, 5, 'https://www.youtube.com/watch?v=Teutja6x5D8', 'https://img.youtube.com/vi/Teutja6x5D8/maxresdefault.jpg', false, 4300
FROM kids_shows WHERE title = 'Finding Nemo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Ocean Adventures with Dory', 'Dobrodružstvá v oceáne', 1, 5, 15, 'https://www.youtube.com/watch?v=B6178Ac90S4', 'https://img.youtube.com/vi/B6178Ac90S4/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'Finding Nemo';

-- Cars episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Best of Lightning McQueen', 'Najlepšie momenty McQueena', 1, 1, 30, 'https://www.youtube.com/watch?v=fdGWRq1dVBA', 'https://img.youtube.com/vi/fdGWRq1dVBA/maxresdefault.jpg', false, 6800
FROM kids_shows WHERE title = 'Cars';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Best of Lightning McQueen from Cars on the Road', 'Najlepšie z Cars on the Road', 1, 2, 45, 'https://www.youtube.com/watch?v=uCvJ9DLRoec', 'https://img.youtube.com/vi/uCvJ9DLRoec/maxresdefault.jpg', false, 5900
FROM kids_shows WHERE title = 'Cars';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Cars On The Road - Full Episodes 1-5', '5 plných epizód Cars on the Road', 1, 3, 42, 'https://www.youtube.com/watch?v=L3gOf2XDp8Y', 'https://img.youtube.com/vi/L3gOf2XDp8Y/maxresdefault.jpg', false, 7400
FROM kids_shows WHERE title = 'Cars';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Lightning McQueen''s Radiator Springs Adventures', 'Hodinová kompilácia dobrodružstiev', 1, 4, 60, 'https://www.youtube.com/watch?v=hvrTmYchUD8', 'https://img.youtube.com/vi/hvrTmYchUD8/maxresdefault.jpg', true, 8900
FROM kids_shows WHERE title = 'Cars';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Lightning McQueen Gets Lost', 'McQueen sa stratí', 1, 5, 12, 'https://www.youtube.com/watch?v=wVPd8EDkrNc', 'https://img.youtube.com/vi/wVPd8EDkrNc/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'Cars';

-- The Incredibles episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Incredibles - All Clips', 'Všetky scény z The Incredibles', 1, 1, 35, 'https://www.youtube.com/watch?v=03di_SbrEo8', 'https://img.youtube.com/vi/03di_SbrEo8/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'The Incredibles';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Incredibles 2 - Baby Jack Jack''s Superpowers', 'Neuveriteľné schopnosti Jack Jacka', 1, 2, 8, 'https://www.youtube.com/watch?v=Ssgcx8FqS6I', 'https://img.youtube.com/vi/Ssgcx8FqS6I/maxresdefault.jpg', false, 6900
FROM kids_shows WHERE title = 'The Incredibles';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Incredibles 2 - All Clips', 'Všetky scény z Incredibles 2', 1, 3, 32, 'https://www.youtube.com/watch?v=jpMzSca3g_0', 'https://img.youtube.com/vi/jpMzSca3g_0/maxresdefault.jpg', false, 5800
FROM kids_shows WHERE title = 'The Incredibles';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Incredibles - Superhero Family Dinner', 'Večera superhrdinskej rodiny', 1, 4, 7, 'https://www.youtube.com/watch?v=pUPUWuVZnzA', 'https://img.youtube.com/vi/pUPUWuVZnzA/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'The Incredibles';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Incredibles - All Movie Clips', 'Kompletné scény z filmu', 1, 5, 42, 'https://www.youtube.com/watch?v=fornYr1d4ZM', 'https://img.youtube.com/vi/fornYr1d4ZM/maxresdefault.jpg', true, 7300
FROM kids_shows WHERE title = 'The Incredibles';