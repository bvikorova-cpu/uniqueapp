-- Add more episodes for existing shows and new shows

-- SpongeBob SquarePants episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Classic Episode Marathon', '240 minút najlepších klasických epizód', 1, 1, 240, 'https://www.youtube.com/watch?v=8B8jplhrlso', 'https://img.youtube.com/vi/8B8jplhrlso/maxresdefault.jpg', false, 8900
FROM kids_shows WHERE title = 'SpongeBob SquarePants';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Season 2 Marathon', 'Viac ako hodina z 2. série', 1, 2, 60, 'https://www.youtube.com/watch?v=8FsJlCpSZRY', 'https://img.youtube.com/vi/8FsJlCpSZRY/maxresdefault.jpg', false, 7500
FROM kids_shows WHERE title = 'SpongeBob SquarePants';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Scariest Episodes Ever', '60 minút najstrašidelnejších epizód', 1, 3, 60, 'https://www.youtube.com/watch?v=5kaOmQzURM4', 'https://img.youtube.com/vi/5kaOmQzURM4/maxresdefault.jpg', false, 6800
FROM kids_shows WHERE title = 'SpongeBob SquarePants';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'What If SpongeBob Didn''t Live In A Pineapple?', 'Špongia hľadá nový domov', 1, 4, 15, 'https://www.youtube.com/watch?v=E3g0C19ZtmA', 'https://img.youtube.com/vi/E3g0C19ZtmA/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'SpongeBob SquarePants';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'One Chaotic Moment from EVERY Episode', '4-hodinová kompilá cia', 1, 5, 240, 'https://www.youtube.com/watch?v=UQnEa8D3C2E', 'https://img.youtube.com/vi/UQnEa8D3C2E/maxresdefault.jpg', true, 12000
FROM kids_shows WHERE title = 'SpongeBob SquarePants';

-- Masha and the Bear episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'La-La-Lamb', 'Roztomilé jahňa sa objaví na prahu', 1, 1, 7, 'https://www.youtube.com/watch?v=mWXrM-OKBNQ', 'https://img.youtube.com/vi/mWXrM-OKBNQ/maxresdefault.jpg', false, 4500
FROM kids_shows WHERE title = 'Masha and the Bear';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Baby Steps - Best Episodes', 'Najlepšie epizódy kompilácia', 1, 2, 45, 'https://www.youtube.com/watch?v=S0yEc4qb3_4', 'https://img.youtube.com/vi/S0yEc4qb3_4/maxresdefault.jpg', false, 5200
FROM kids_shows WHERE title = 'Masha and the Bear';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Welcome Out of Here', 'Zajac stratí strechu nad hlavou', 1, 3, 7, 'https://www.youtube.com/watch?v=iCMLAGh7ZuY', 'https://img.youtube.com/vi/iCMLAGh7ZuY/maxresdefault.jpg', false, 3800
FROM kids_shows WHERE title = 'Masha and the Bear';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'It''s No Slice of Heaven', 'Nová epizóda plná zábavy', 1, 4, 7, 'https://www.youtube.com/watch?v=FJ2q97ltlN0', 'https://img.youtube.com/vi/FJ2q97ltlN0/maxresdefault.jpg', false, 4100
FROM kids_shows WHERE title = 'Masha and the Bear';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Shower Power', 'Máša sa stará o lesných obyvateľov', 1, 5, 7, 'https://www.youtube.com/watch?v=HrchZ6KACq8', 'https://img.youtube.com/vi/HrchZ6KACq8/maxresdefault.jpg', false, 3600
FROM kids_shows WHERE title = 'Masha and the Bear';

-- PJ Masks episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Power Heroes - First Episode', 'Hrdinovia všade okolo nás', 1, 1, 23, 'https://www.youtube.com/watch?v=8cCeSiztJVQ', 'https://img.youtube.com/vi/8cCeSiztJVQ/maxresdefault.jpg', false, 5600
FROM kids_shows WHERE title = 'PJ Masks';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'PJ Seeker Adventure', '1 hodina dobrodružstiev', 1, 2, 60, 'https://www.youtube.com/watch?v=Bg9qw4GbGfk', 'https://img.youtube.com/vi/Bg9qw4GbGfk/maxresdefault.jpg', false, 4900
FROM kids_shows WHERE title = 'PJ Masks';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mystery Mountain Dragon', 'Night Ninja ukradne Dragon Gong', 1, 3, 23, 'https://www.youtube.com/watch?v=Bxh4-S85th0', 'https://img.youtube.com/vi/Bxh4-S85th0/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'PJ Masks';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Ninjas and Powers', 'PJ Masks vs Night Ninja', 1, 4, 23, 'https://www.youtube.com/watch?v=mtptaFyDcuc', 'https://img.youtube.com/vi/mtptaFyDcuc/maxresdefault.jpg', false, 3800
FROM kids_shows WHERE title = 'PJ Masks';

-- Super Wings episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Super Wings Season 6 Live', 'Živé vysielanie 6. série', 1, 1, 120, 'https://www.youtube.com/watch?v=JGna-fSLK-Y', 'https://img.youtube.com/vi/JGna-fSLK-Y/maxresdefault.jpg', false, 6700
FROM kids_shows WHERE title = 'Super Wings';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Super Wings Season 4 Live', 'Živé vysielanie 4. série', 1, 2, 120, 'https://www.youtube.com/watch?v=ZtygSsmFF80', 'https://img.youtube.com/vi/ZtygSsmFF80/maxresdefault.jpg', false, 5900
FROM kids_shows WHERE title = 'Super Wings';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Best Compilation EP98', 'Najlepšie momenty', 1, 3, 60, 'https://www.youtube.com/watch?v=mqpCkkelz3s', 'https://img.youtube.com/vi/mqpCkkelz3s/maxresdefault.jpg', false, 4800
FROM kids_shows WHERE title = 'Super Wings';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Season 1 Compilation', 'Kompilácia 1. série EP1-26', 1, 4, 90, 'https://www.youtube.com/watch?v=SaqRenb0NRk', 'https://img.youtube.com/vi/SaqRenb0NRk/maxresdefault.jpg', false, 5400
FROM kids_shows WHERE title = 'Super Wings';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'World Guardians - TINO', 'Nový superhrdina sa pridáva', 1, 5, 23, 'https://www.youtube.com/watch?v=sSYoHsiCY0I', 'https://img.youtube.com/vi/sSYoHsiCY0I/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'Super Wings';

-- Scooby-Doo episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Classic Cartoon Compilation', 'Klasická kompilácia kreslených', 1, 1, 45, 'https://www.youtube.com/watch?v=Edr6_-L3bi4', 'https://img.youtube.com/vi/Edr6_-L3bi4/maxresdefault.jpg', false, 7800
FROM kids_shows WHERE title = 'Scooby-Doo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Spooky Towns', 'Návšteva strašidelných miest', 1, 2, 30, 'https://www.youtube.com/watch?v=GsNE3dhliOk', 'https://img.youtube.com/vi/GsNE3dhliOk/maxresdefault.jpg', false, 6500
FROM kids_shows WHERE title = 'Scooby-Doo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mystery Incorporated - Ghoul School', 'Záhady v škole', 1, 3, 25, 'https://www.youtube.com/watch?v=4RAGV2EUSJE', 'https://img.youtube.com/vi/4RAGV2EUSJE/maxresdefault.jpg', false, 5900
FROM kids_shows WHERE title = 'Scooby-Doo';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'A Clue for Scooby-Doo', 'Klasická epizóda S1E2', 1, 4, 22, 'https://www.youtube.com/watch?v=7fHEv7PrCOs', 'https://img.youtube.com/vi/7fHEv7PrCOs/maxresdefault.jpg', false, 4700
FROM kids_shows WHERE title = 'Scooby-Doo';