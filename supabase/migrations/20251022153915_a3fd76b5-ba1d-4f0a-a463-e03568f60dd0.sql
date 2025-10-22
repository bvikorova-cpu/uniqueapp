-- Add more episodes for additional shows

-- Dora the Explorer episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Full Episodes Marathon', '2 hodiny dobrodružstiev s Dorou', 1, 1, 120, 'https://www.youtube.com/watch?v=FZpJXVKtIj0', 'https://img.youtube.com/vi/FZpJXVKtIj0/maxresdefault.jpg', false, 6800
FROM kids_shows WHERE title = 'Dora the Explorer';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Adventures with Amigos', '240 minút plných priateľov', 1, 2, 240, 'https://www.youtube.com/watch?v=YgkXQs-N_SI', 'https://img.youtube.com/vi/YgkXQs-N_SI/maxresdefault.jpg', true, 8900
FROM kids_shows WHERE title = 'Dora the Explorer';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Dora''s Ballet Adventure', 'Dora sa stáva baletkou', 1, 3, 23, 'https://www.youtube.com/watch?v=4hnAAqegCYk', 'https://img.youtube.com/vi/4hnAAqegCYk/maxresdefault.jpg', false, 5400
FROM kids_shows WHERE title = 'Dora the Explorer';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Musical Episodes', '90 minút hudobných epizód', 1, 4, 90, 'https://www.youtube.com/watch?v=GPAYzaE-trs', 'https://img.youtube.com/vi/GPAYzaE-trs/maxresdefault.jpg', false, 4700
FROM kids_shows WHERE title = 'Dora the Explorer';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Very Sleepy Bear', 'Dora pomáha ospalému medveďovi', 1, 5, 23, 'https://www.youtube.com/watch?v=J4m3kjE2gUg', 'https://img.youtube.com/vi/J4m3kjE2gUg/maxresdefault.jpg', false, 7200
FROM kids_shows WHERE title = 'Dora the Explorer';

-- Daniel Tiger's Neighborhood episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Daniel Asks What Friends Like', 'Daniel sa učí pýtať sa priateľov', 1, 1, 27, 'https://www.youtube.com/watch?v=5AJBCXTrPJA', 'https://img.youtube.com/vi/5AJBCXTrPJA/maxresdefault.jpg', false, 3400
FROM kids_shows WHERE title = 'Daniel Tiger''s Neighborhood';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Miss Elaina''s Bandage', 'Náplasti, ktoré vyzerajú ako pokožka', 1, 2, 27, 'https://www.youtube.com/watch?v=aVvC6vEMemw', 'https://img.youtube.com/vi/aVvC6vEMemw/maxresdefault.jpg', false, 2900
FROM kids_shows WHERE title = 'Daniel Tiger''s Neighborhood';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Colorful Adventures Compilation', 'Kompilácia farebných dobrodružstiev', 1, 3, 45, 'https://www.youtube.com/watch?v=3lD4_FyUPCU', 'https://img.youtube.com/vi/3lD4_FyUPCU/maxresdefault.jpg', false, 3200
FROM kids_shows WHERE title = 'Daniel Tiger''s Neighborhood';

-- Blippi episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Learn Colors at the Beach', 'Učíme sa farby na pláži', 1, 1, 30, 'https://www.youtube.com/watch?v=0IOy1HZZ2nw', 'https://img.youtube.com/vi/0IOy1HZZ2nw/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'Blippi';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Colors and Numbers', 'Učíme sa farby a čísla', 1, 2, 60, 'https://www.youtube.com/watch?v=UdrG_UUNacY', 'https://img.youtube.com/vi/UdrG_UUNacY/maxresdefault.jpg', false, 8900
FROM kids_shows WHERE title = 'Blippi';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Indoor Playground Fun', 'Zábava na vnútornom ihrisku', 1, 3, 30, 'https://www.youtube.com/watch?v=bY47YPWuias', 'https://img.youtube.com/vi/bY47YPWuias/maxresdefault.jpg', false, 6700
FROM kids_shows WHERE title = 'Blippi';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Children''s Museum Adventure', 'Návšteva detského múzea', 1, 4, 30, 'https://www.youtube.com/watch?v=7A5HnRqbBho', 'https://img.youtube.com/vi/7A5HnRqbBho/maxresdefault.jpg', false, 5400
FROM kids_shows WHERE title = 'Blippi';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Jungle Animals at Playground', 'Učíme sa o zvieratkách z džungle', 1, 5, 30, 'https://www.youtube.com/watch?v=rbn8vNHbPbE', 'https://img.youtube.com/vi/rbn8vNHbPbE/maxresdefault.jpg', false, 4900
FROM kids_shows WHERE title = 'Blippi';

-- Add episodes for Toy Story
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Adventures Through Toy Story', 'Dobrodružstvá Woodyho a Buzza', 1, 1, 25, 'https://www.youtube.com/watch?v=6F8k_cJ3JPA', 'https://img.youtube.com/vi/6F8k_cJ3JPA/maxresdefault.jpg', false, 3400
FROM kids_shows WHERE title = 'Toy Story';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Toy Story 3 - All Clips', 'Všetky najlepšie scény z Toy Story 3', 1, 2, 30, 'https://www.youtube.com/watch?v=hllI8OCZS9o', 'https://img.youtube.com/vi/hllI8OCZS9o/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'Toy Story';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Toy Story 4 - All Clips', 'Všetky scény z Toy Story 4', 1, 3, 35, 'https://www.youtube.com/watch?v=jM6TPoWAHP8', 'https://img.youtube.com/vi/jM6TPoWAHP8/maxresdefault.jpg', false, 3800
FROM kids_shows WHERE title = 'Toy Story';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Toy Story 3 Compilation', 'Najlepšie momenty z TS3', 1, 4, 28, 'https://www.youtube.com/watch?v=5bTyYTcIsuE', 'https://img.youtube.com/vi/5bTyYTcIsuE/maxresdefault.jpg', false, 5100
FROM kids_shows WHERE title = 'Toy Story';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Toy Story 4 Complete Clips', 'Kompletné scény z Toy Story 4', 1, 5, 40, 'https://www.youtube.com/watch?v=9pn8utbTtnU', 'https://img.youtube.com/vi/9pn8utbTtnU/maxresdefault.jpg', true, 6200
FROM kids_shows WHERE title = 'Toy Story';

-- Add Princess Stories
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Disney Princess Storytime', 'Rozprávky s Tianou, Jasminou a ďalšími', 1, 1, 35, 'https://www.youtube.com/watch?v=LCagvyO2Wag', 'https://img.youtube.com/vi/LCagvyO2Wag/maxresdefault.jpg', false, 4500
FROM kids_shows WHERE title = 'Fairy Tale Castle';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Sleeping Beauty & 4 Princesses', 'Šípková Ruženka a jej priateľky', 1, 2, 42, 'https://www.youtube.com/watch?v=cmp7tNbnKlA', 'https://img.youtube.com/vi/cmp7tNbnKlA/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'Fairy Tale Castle';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Princess Stories Compilation', '35 minút princeznovských príbehov', 1, 3, 35, 'https://www.youtube.com/watch?v=wCYcguuDBCo', 'https://img.youtube.com/vi/wCYcguuDBCo/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'Fairy Tale Castle';