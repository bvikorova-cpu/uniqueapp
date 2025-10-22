-- Insert real YouTube episodes for shows
-- Peppa Pig episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Muddy Puddles', 'Peppa a George milujú skákať v bahnitých kalužiach', 1, 1, 7, 'https://www.youtube.com/watch?v=xKyGF6tMt3M', 'https://img.youtube.com/vi/xKyGF6tMt3M/maxresdefault.jpg', false, 1250
FROM kids_shows WHERE title = 'Peppa Pig';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'George''s New Dinosaur', 'George dostane nového dinosaura', 1, 2, 7, 'https://www.youtube.com/watch?v=0QMGSaIiiCI', 'https://img.youtube.com/vi/0QMGSaIiiCI/maxresdefault.jpg', false, 980
FROM kids_shows WHERE title = 'Peppa Pig';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Playgroup', 'Peppa ide do škôlky', 1, 3, 7, 'https://www.youtube.com/watch?v=lYQbA8IQzZI', 'https://img.youtube.com/vi/lYQbA8IQzZI/maxresdefault.jpg', false, 856
FROM kids_shows WHERE title = 'Peppa Pig';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Secret Club', 'Peppa a priatelia majú tajný klub', 1, 4, 7, 'https://www.youtube.com/watch?v=aETD3sPtglA', 'https://img.youtube.com/vi/aETD3sPtglA/maxresdefault.jpg', false, 743
FROM kids_shows WHERE title = 'Peppa Pig';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'George''s Mischievous Adventure', 'George má vlastnú tajnú miestnosť', 1, 5, 7, 'https://www.youtube.com/watch?v=1UXPLvJ98F4', 'https://img.youtube.com/vi/1UXPLvJ98F4/maxresdefault.jpg', false, 621
FROM kids_shows WHERE title = 'Peppa Pig';

-- Paw Patrol episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Pups Save the Penguins', 'Psy zachraňujú tučniakov', 1, 1, 23, 'https://www.youtube.com/watch?v=z1vXJVI2L5M', 'https://img.youtube.com/vi/z1vXJVI2L5M/maxresdefault.jpg', false, 2340
FROM kids_shows WHERE title = 'Paw Patrol';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Pirate Treasure Adventure', 'Psy hľadajú pirátsky poklad', 1, 2, 23, 'https://www.youtube.com/watch?v=hc4hH7JMV_g', 'https://img.youtube.com/vi/hc4hH7JMV_g/maxresdefault.jpg', false, 1890
FROM kids_shows WHERE title = 'Paw Patrol';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Pups Save A Walrus', 'Záchranná misia pre mrože', 1, 3, 23, 'https://www.youtube.com/watch?v=cS-BGJ9E8XA', 'https://img.youtube.com/vi/cS-BGJ9E8XA/maxresdefault.jpg', false, 1567
FROM kids_shows WHERE title = 'Paw Patrol';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Rubble & Pirate Treasure', 'Rubble objavuje pirátskeho pokladu', 1, 4, 23, 'https://www.youtube.com/watch?v=QqOIJZvn-aU', 'https://img.youtube.com/vi/QqOIJZvn-aU/maxresdefault.jpg', false, 1234
FROM kids_shows WHERE title = 'Paw Patrol';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mighty Pups Mission', 'Mocní psíkovia zastavujú raketu', 1, 5, 23, 'https://www.youtube.com/watch?v=Kgz-wXW2LrI', 'https://img.youtube.com/vi/Kgz-wXW2LrI/maxresdefault.jpg', false, 987
FROM kids_shows WHERE title = 'Paw Patrol';

-- Bluey episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Beach', 'Bluey a rodina idú na pláž', 1, 1, 7, 'https://www.youtube.com/watch?v=0RYe146FjJ8', 'https://img.youtube.com/vi/0RYe146FjJ8/maxresdefault.jpg', false, 3456
FROM kids_shows WHERE title = 'Bluey';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Unicorse', 'Tatko hrá divokého jednorožca', 1, 2, 7, 'https://www.youtube.com/watch?v=Xw3-3jQQMBk', 'https://img.youtube.com/vi/Xw3-3jQQMBk/maxresdefault.jpg', false, 2890
FROM kids_shows WHERE title = 'Bluey';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Pavlova', 'Bluey a Bingo otvárajú kaviarňu', 1, 3, 7, 'https://www.youtube.com/watch?v=ERyw2dz2-ZM', 'https://img.youtube.com/vi/ERyw2dz2-ZM/maxresdefault.jpg', false, 2345
FROM kids_shows WHERE title = 'Bluey';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Dad Baby', 'Tatko predstiera, že je bábätko', 1, 4, 7, 'https://www.youtube.com/watch?v=aP-qKaig84M', 'https://img.youtube.com/vi/aP-qKaig84M/maxresdefault.jpg', false, 1987
FROM kids_shows WHERE title = 'Bluey';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Pool', 'Rodina ide do bazéna', 1, 5, 7, 'https://www.youtube.com/watch?v=AMppfY8aF6M', 'https://img.youtube.com/vi/AMppfY8aF6M/maxresdefault.jpg', false, 1654
FROM kids_shows WHERE title = 'Bluey';

-- Cocomelon episodes
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'JJ Song', 'Pesničky o JJ a jeho rodine', 1, 1, 35, 'https://www.youtube.com/watch?v=4ak75az8Ajs', 'https://img.youtube.com/vi/4ak75az8Ajs/maxresdefault.jpg', false, 4567
FROM kids_shows WHERE title = 'Cocomelon';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Fruits and Vegetables Song', 'Učíme sa o ovocí a zelenine', 1, 2, 3, 'https://www.youtube.com/watch?v=j86yN2bOiBQ', 'https://img.youtube.com/vi/j86yN2bOiBQ/maxresdefault.jpg', false, 3890
FROM kids_shows WHERE title = 'Cocomelon';

INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'The Opposites Song', 'Učíme sa o protikladoch', 1, 3, 28, 'https://www.youtube.com/watch?v=p6AC-4mNxhk', 'https://img.youtube.com/vi/p6AC-4mNxhk/maxresdefault.jpg', false, 3234
FROM kids_shows WHERE title = 'Cocomelon';

-- Mickey Mouse Clubhouse
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Mickey Mouse Clubhouse Season 1', 'Všetky epizódy prvej série', 1, 1, 120, 'https://www.youtube.com/watch?v=o_YV7lSEbO0', 'https://img.youtube.com/vi/o_YV7lSEbO0/maxresdefault.jpg', false, 5678
FROM kids_shows WHERE title = 'Mickey Mouse Clubhouse';

-- Lilo & Stitch
INSERT INTO kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, 'Richter', 'Lilo a Stitch hľadajú Experiment 513', 1, 1, 23, 'https://www.youtube.com/watch?v=iRTEdxpMiRo', 'https://img.youtube.com/vi/iRTEdxpMiRo/maxresdefault.jpg', false, 2890
FROM kids_shows WHERE title = 'Lilo & Stitch';