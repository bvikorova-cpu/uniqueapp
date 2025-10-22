-- Add more Disney/Pixar episodes

-- Encanto episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Encanto - All Movie Clips', 'Všetky scény z Encanto', 1, 1, 42, 'https://www.youtube.com/watch?v=MeedDhXDjL0', 'https://img.youtube.com/vi/MeedDhXDjL0/maxresdefault.jpg', false, 7800
FROM kids_shows WHERE title = 'Encanto';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Encanto - All Songs & Clips', 'Všetky pesničky a scény', 1, 2, 50, 'https://www.youtube.com/watch?v=cxCH5ufvYVM', 'https://img.youtube.com/vi/cxCH5ufvYVM/maxresdefault.jpg', false, 9200
FROM kids_shows WHERE title = 'Encanto';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mirabel & Bruno Scene', 'Mirabel stretáva Bruna', 1, 3, 8, 'https://www.youtube.com/watch?v=EIOHX-jbFdM', 'https://img.youtube.com/vi/EIOHX-jbFdM/maxresdefault.jpg', false, 6400
FROM kids_shows WHERE title = 'Encanto';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mirabel''s Gift', 'Mirabelin špeciálny dar', 1, 4, 6, 'https://www.youtube.com/watch?v=ANCtnvDL-qo', 'https://img.youtube.com/vi/ANCtnvDL-qo/maxresdefault.jpg', false, 5300
FROM kids_shows WHERE title = 'Encanto';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Dos Oruguitas Song', 'Krásna pieseň z Encanto', 1, 5, 4, 'https://www.youtube.com/watch?v=1i4C1EU70tQ', 'https://img.youtube.com/vi/1i4C1EU70tQ/maxresdefault.jpg', false, 4800
FROM kids_shows WHERE title = 'Encanto';

-- Monsters Inc episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Adventures with Mike and Sulley', 'Dobrodružstvá Mika a Sulleyho', 1, 1, 28, 'https://www.youtube.com/watch?v=kRLZoxIA4aI', 'https://img.youtube.com/vi/kRLZoxIA4aI/maxresdefault.jpg', false, 6700
FROM kids_shows WHERE title = 'Monsters Inc';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Monsters University - Mike and Sulley''s First Morning', 'Prvé ráno na univerzite', 1, 2, 5, 'https://www.youtube.com/watch?v=0adiUC2vXN8', 'https://img.youtube.com/vi/0adiUC2vXN8/maxresdefault.jpg', false, 4900
FROM kids_shows WHERE title = 'Monsters Inc';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mike and Sulley Meet', 'Ako sa Mike a Sulley spoznali', 1, 3, 6, 'https://www.youtube.com/watch?v=u0X3py9Hq3A', 'https://img.youtube.com/vi/u0X3py9Hq3A/maxresdefault.jpg', false, 5200
FROM kids_shows WHERE title = 'Monsters Inc';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Sulley & Mike Meet the Snowman', 'Stretnutie so snehuliakom', 1, 4, 7, 'https://www.youtube.com/watch?v=rRzgjBkkXzI', 'https://img.youtube.com/vi/rRzgjBkkXzI/maxresdefault.jpg', false, 4600
FROM kids_shows WHERE title = 'Monsters Inc';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Monsters University - All Clips', 'Všetky scény z Monsters University', 1, 5, 35, 'https://www.youtube.com/watch?v=Jw5-en9My1o', 'https://img.youtube.com/vi/Jw5-en9My1o/maxresdefault.jpg', true, 7100
FROM kids_shows WHERE title = 'Monsters Inc';

-- Ratatouille episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Linguini & Remy''s Kitchen Chaos', 'Chaos v kuchyni', 1, 1, 18, 'https://www.youtube.com/watch?v=blU9Yhn1kgU', 'https://img.youtube.com/vi/blU9Yhn1kgU/maxresdefault.jpg', false, 5400
FROM kids_shows WHERE title = 'Ratatouille';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Remy Shows His Chopping Skills', 'Remy predvádza varenie', 1, 2, 8, 'https://www.youtube.com/watch?v=mwgECMrKFi8', 'https://img.youtube.com/vi/mwgECMrKFi8/maxresdefault.jpg', false, 4800
FROM kids_shows WHERE title = 'Ratatouille';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Remy''s Secret Skills Revealed', 'Tajné schopnosti kuchára', 1, 3, 10, 'https://www.youtube.com/watch?v=3o3kXAb8r3w', 'https://img.youtube.com/vi/3o3kXAb8r3w/maxresdefault.jpg', false, 5900
FROM kids_shows WHERE title = 'Ratatouille';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Chef Remy Gone Wild', 'Remy v akcii', 1, 4, 12, 'https://www.youtube.com/watch?v=pjHO2hI9a1k', 'https://img.youtube.com/vi/pjHO2hI9a1k/maxresdefault.jpg', false, 4200
FROM kids_shows WHERE title = 'Ratatouille';

-- Up episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Carl & Ellie: Through the Years', 'Životný príbeh Carla a Ellie', 1, 1, 8, 'https://www.youtube.com/watch?v=TT0aDbaFK-I', 'https://img.youtube.com/vi/TT0aDbaFK-I/maxresdefault.jpg', false, 8900
FROM kids_shows WHERE title = 'Up';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Carl Meets Ellie for the First Time', 'Prvé stretnutie Carla a Ellie', 1, 2, 5, 'https://www.youtube.com/watch?v=62lJyT6YLmA', 'https://img.youtube.com/vi/62lJyT6YLmA/maxresdefault.jpg', false, 6700
FROM kids_shows WHERE title = 'Up';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Meet Russell', 'Spoznajte Russella', 1, 3, 6, 'https://www.youtube.com/watch?v=ILddD8QNbuk', 'https://img.youtube.com/vi/ILddD8QNbuk/maxresdefault.jpg', false, 5400
FROM kids_shows WHERE title = 'Up';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Up Movie Clip - Meet Russell', 'Russell prichádza', 1, 4, 7, 'https://www.youtube.com/watch?v=QLW_rirXaz4', 'https://img.youtube.com/vi/QLW_rirXaz4/maxresdefault.jpg', false, 4900
FROM kids_shows WHERE title = 'Up';

-- Inside Out episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Riley''s New Emotions', 'Nové emócie Riley', 1, 1, 6, 'https://www.youtube.com/watch?v=dFKtrAZpnko', 'https://img.youtube.com/vi/dFKtrAZpnko/maxresdefault.jpg', false, 7200
FROM kids_shows WHERE title = 'Inside Out';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Meet Riley''s Emotions', 'Spoznajte emócie Riley', 1, 2, 15, 'https://www.youtube.com/watch?v=u6m4TTyoiNc', 'https://img.youtube.com/vi/u6m4TTyoiNc/maxresdefault.jpg', false, 6400
FROM kids_shows WHERE title = 'Inside Out';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Inside Out 2 - All Clips', 'Všetky scény z Inside Out 2', 1, 3, 38, 'https://www.youtube.com/watch?v=M7KelAaqsCg', 'https://img.youtube.com/vi/M7KelAaqsCg/maxresdefault.jpg', false, 8100
FROM kids_shows WHERE title = 'Inside Out';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Meet Riley''s Emotions Explained', 'Vysvetlenie emócií', 1, 4, 5, 'https://www.youtube.com/watch?v=1S0RKRRyqhQ', 'https://img.youtube.com/vi/1S0RKRRyqhQ/maxresdefault.jpg', false, 5800
FROM kids_shows WHERE title = 'Inside Out';