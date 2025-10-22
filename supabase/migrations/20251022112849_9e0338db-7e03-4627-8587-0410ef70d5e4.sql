-- Add 10 new Disney classic shows
INSERT INTO public.kids_shows (title, description, thumbnail_url, cover_image_url, category, age_rating, is_premium)
VALUES
  ('Scooby-Doo', 'Mystery-solving adventures with Scooby-Doo and the gang', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', 'https://img.youtube.com/vi/hx8I6hMXE4/maxresdefault.jpg', 'adventure', '6+', false),
  ('Mr. Bean', 'Hilarious animated adventures of the lovable Mr. Bean', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', 'comedy', '6+', false),
  ('Snow White', 'The classic Disney fairy tale of Snow White and the Seven Dwarfs', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Pinocchio', 'The magical story of the wooden puppet who dreams of becoming a real boy', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Dumbo', 'The heartwarming tale of the flying elephant with big ears', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Bambi', 'Follow the adventures of a young deer in the forest', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Cinderella', 'The magical story of Cinderella and her glass slippers', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Alice in Wonderland', 'Join Alice on her whimsical adventures in Wonderland', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', 'fantasy', '6+', false),
  ('Beauty and the Beast', 'The enchanting tale of Belle and the Beast', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', 'fantasy', '3+', false),
  ('Aladdin', 'Experience the magical adventures of Aladdin and Princess Jasmine', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', 'adventure', '3+', false);

-- Add 10 episodes for Scooby-Doo
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Haunted Mansion Mystery', 'Scooby and the gang investigate a spooky haunted mansion', 1, 1, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 12500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Ghost of Redbeard', 'A pirate ghost haunts the marina', 1, 2, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 11200),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'Mystery at the Museum', 'Strange things happen at the natural history museum', 1, 3, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 10800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Phantom of the Amusement Park', 'A ghost terrorizes the local amusement park', 1, 4, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 13000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Creepy Carnival', 'Mystery at the traveling carnival', 1, 5, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 9800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Witch Doctor Mystery', 'A mysterious witch doctor appears in town', 1, 6, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 10500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Vampire Strikes Back', 'A vampire is on the loose', 1, 7, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 11900),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Alien Invaders', 'UFO sightings in Crystal Cove', 1, 8, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 12800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Mummy Returns', 'An ancient mummy awakens', 1, 9, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 13500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo'), 'The Phantom Ship', 'A ghost ship appears in the harbor', 1, 10, 22, 'https://www.youtube.com/watch?v=hx8I6hMKXE4', 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg', false, 14000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Mr. Bean
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'The Arrival', 'Mr. Bean arrives in his unique style', 1, 1, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 15000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'Teddy Bear Adventures', 'Mr. Bean and Teddy go on an adventure', 1, 2, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 14200),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'The Exam', 'Mr. Bean takes an important test', 1, 3, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 13800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'Swimming Pool Fun', 'Mr. Bean visits the swimming pool', 1, 4, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 16000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'The Library', 'Hilarious moments at the library', 1, 5, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 12800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'Shopping Madness', 'Mr. Bean goes shopping', 1, 6, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 13500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'The Restaurant', 'Dinner time with Mr. Bean', 1, 7, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 14900),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'Beach Day', 'Mr. Bean at the beach', 1, 8, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 15800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'The Park', 'Adventures in the park', 1, 9, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 16500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Mr. Bean'), 'Christmas Special', 'Mr. Bean celebrates Christmas', 1, 10, 11, 'https://www.youtube.com/watch?v=LbEHlCZCHys', 'https://img.youtube.com/vi/LbEHlCZCHys/maxresdefault.jpg', false, 18000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Snow White
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'The Magic Mirror', 'The Evil Queen consults her magic mirror', 1, 1, 83, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 25000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Meeting the Dwarfs', 'Snow White discovers the seven dwarfs cottage', 1, 2, 15, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 22000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Whistle While You Work', 'Snow White cleans the cottage', 1, 3, 12, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 20000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Heigh-Ho', 'The dwarfs march home from work', 1, 4, 10, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 23000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'The Poisoned Apple', 'The Evil Queen prepares her deadly plan', 1, 5, 18, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 19000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Some Day My Prince Will Come', 'Snow White dreams of her prince', 1, 6, 13, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 21000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'The Wishing Well', 'Snow White makes a wish', 1, 7, 11, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 18500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Forest Friends', 'Snow White meets the woodland creatures', 1, 8, 14, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 20500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'True Loves Kiss', 'The prince awakens Snow White', 1, 9, 16, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 24000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Snow White'), 'Happily Ever After', 'Snow White and the prince ride off together', 1, 10, 12, 'https://www.youtube.com/watch?v=oUUu_0iLxWQ', 'https://img.youtube.com/vi/oUUu_0iLxWQ/maxresdefault.jpg', false, 26000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Pinocchio
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'When You Wish Upon a Star', 'Geppetto wishes for a real boy', 1, 1, 88, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 22000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Meeting Jiminy Cricket', 'Pinocchio meets his conscience', 1, 2, 12, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 19000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'I Got No Strings', 'Pinocchio performs for Stromboli', 1, 3, 14, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 21000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Pleasure Island', 'Pinocchio visits the mysterious island', 1, 4, 16, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 18500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Honest John and Gideon', 'The fox and cat trick Pinocchio', 1, 5, 13, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 17800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'The Blue Fairy', 'The fairy brings Pinocchio to life', 1, 6, 11, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 20500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Growing Nose', 'Pinocchios nose grows when he lies', 1, 7, 10, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 23000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Monstro the Whale', 'Inside the giant whale', 1, 8, 15, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 19500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'Becoming Brave', 'Pinocchio saves Geppetto', 1, 9, 17, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 21500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Pinocchio'), 'A Real Boy', 'Pinocchio becomes a real boy', 1, 10, 14, 'https://www.youtube.com/watch?v=kSW3mXl8gXU', 'https://img.youtube.com/vi/kSW3mXl8gXU/maxresdefault.jpg', false, 24000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Dumbo
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Baby Mine', 'Dumbo is born with big ears', 1, 1, 64, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 20000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Casey Jr.', 'The circus train arrives', 1, 2, 10, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 18000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Meeting Timothy', 'Dumbo meets Timothy Mouse', 1, 3, 12, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 19500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Pink Elephants', 'Dumbos magical dream sequence', 1, 4, 14, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 22000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Learning to Fly', 'Dumbo discovers he can fly', 1, 5, 13, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 23500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'The Magic Feather', 'Timothy gives Dumbo a magic feather', 1, 6, 11, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 21000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Circus Performance', 'Dumbo performs at the circus', 1, 7, 15, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 20500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'The Crows', 'Dumbo meets the friendly crows', 1, 8, 12, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 19800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'When I See an Elephant Fly', 'The crows teach Dumbo to believe', 1, 9, 13, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 21500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Dumbo'), 'Flying High', 'Dumbo becomes a star', 1, 10, 14, 'https://www.youtube.com/watch?v=0_1IMZmJe-U', 'https://img.youtube.com/vi/0_1IMZmJe-U/maxresdefault.jpg', false, 24500)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Bambi
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'A New Prince is Born', 'Bambi is born in the forest', 1, 1, 70, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 21000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Meeting Thumper', 'Bambi meets his rabbit friend', 1, 2, 12, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 19500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'First Steps', 'Bambi learns to walk', 1, 3, 10, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 20000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Meeting Flower', 'Bambi meets the skunk', 1, 4, 11, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 18800),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'The Meadow', 'Bambis first visit to the meadow', 1, 5, 13, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 22000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Meeting Faline', 'Bambi meets the young doe', 1, 6, 12, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 20500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Little April Shower', 'Bambi experiences his first rain', 1, 7, 11, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 19000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Winter Arrives', 'The forest experiences winter', 1, 8, 14, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 21500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'Growing Up', 'Bambi becomes a young buck', 1, 9, 15, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 23000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Bambi'), 'The Great Prince', 'Bambi becomes the Prince of the Forest', 1, 10, 13, 'https://www.youtube.com/watch?v=8hTcoiHMxXE', 'https://img.youtube.com/vi/8hTcoiHMxXE/maxresdefault.jpg', false, 24500)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Cinderella
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'A Dream is a Wish', 'Cinderella dreams of a better life', 1, 1, 74, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 26000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'The Mice Friends', 'Cinderella befriends the mice', 1, 2, 13, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 23000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'The Wicked Stepmother', 'Life with Lady Tremaine', 1, 3, 14, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 22500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'The Royal Ball Invitation', 'An invitation arrives from the palace', 1, 4, 12, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 24000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'Fairy Godmother', 'The magical fairy godmother appears', 1, 5, 16, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 28000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'Bibbidi-Bobbidi-Boo', 'The magical transformation', 1, 6, 11, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 27000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'The Royal Ball', 'Cinderella dances with the Prince', 1, 7, 15, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 29000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'Midnight Strikes', 'Cinderella flees at midnight', 1, 8, 13, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 25500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'The Glass Slipper', 'The prince searches for Cinderella', 1, 9, 14, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 27500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Cinderella'), 'True Love', 'Cinderella and the prince reunite', 1, 10, 12, 'https://www.youtube.com/watch?v=rbKT7o-LqD4', 'https://img.youtube.com/vi/rbKT7o-LqD4/maxresdefault.jpg', false, 30000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Alice in Wonderland
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'Down the Rabbit Hole', 'Alice follows the White Rabbit', 1, 1, 75, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 24000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'Drink Me', 'Alice discovers the magic potion', 1, 2, 12, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 21000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'Meeting the Cheshire Cat', 'Alice encounters the mysterious cat', 1, 3, 14, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 23500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'The Mad Tea Party', 'Alice joins the Mad Hatter', 1, 4, 16, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 25000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'The Caterpillar', 'Alice meets the wise caterpillar', 1, 5, 11, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 20500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'The Queen of Hearts', 'Alice meets the temperamental queen', 1, 6, 15, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 26000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'Painting the Roses Red', 'The card soldiers paint the roses', 1, 7, 10, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 22500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'The Croquet Game', 'Alice plays croquet with flamingos', 1, 8, 13, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 23000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'The Trial', 'Alice attends the peculiar trial', 1, 9, 14, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 24500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Alice in Wonderland'), 'Waking Up', 'Alice awakens from her dream', 1, 10, 11, 'https://www.youtube.com/watch?v=MdqEQY2MjaM', 'https://img.youtube.com/vi/MdqEQY2MjaM/maxresdefault.jpg', false, 21500)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Beauty and the Beast
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'Belle', 'Introduction to Belle and her village', 1, 1, 84, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 28000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'The Enchanted Castle', 'Maurice discovers the castle', 1, 2, 14, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 25000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'Be Our Guest', 'Lumiere entertains Belle', 1, 3, 16, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 30000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'Something There', 'Belle and Beast grow closer', 1, 4, 13, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 27000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'The West Wing', 'Belle discovers the enchanted rose', 1, 5, 12, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 26000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'Gaston', 'The villain plots his schemes', 1, 6, 11, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 24000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'The Library', 'Beast gives Belle his library', 1, 7, 10, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 28500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'Beauty and the Beast Dance', 'The iconic ballroom dance', 1, 8, 15, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 32000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'The Mob', 'The villagers storm the castle', 1, 9, 14, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 29000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Beauty and the Beast'), 'True Love Breaks the Spell', 'The curse is lifted', 1, 10, 13, 'https://www.youtube.com/watch?v=CxfJ1YeCHmI', 'https://img.youtube.com/vi/CxfJ1YeCHmI/maxresdefault.jpg', false, 31000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);

-- Add 10 episodes for Aladdin
INSERT INTO public.kids_episodes (show_id, title, description, season_number, episode_number, duration_minutes, video_url, thumbnail_url, is_premium, views)
SELECT id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views
FROM (VALUES
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Arabian Nights', 'The story of Aladdin begins', 1, 1, 90, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 27000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'One Jump Ahead', 'Aladdin evades the palace guards', 1, 2, 13, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 24000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Meeting Jasmine', 'Aladdin meets Princess Jasmine', 1, 3, 14, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 26000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'The Cave of Wonders', 'Aladdin enters the magical cave', 1, 4, 16, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 28000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Friend Like Me', 'The Genie introduces himself', 1, 5, 15, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 30000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Prince Ali', 'Aladdin becomes Prince Ali', 1, 6, 14, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 29000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'A Whole New World', 'The magic carpet ride', 1, 7, 17, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 33000),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Jafar the Sorcerer', 'Jafar gains ultimate power', 1, 8, 15, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 27500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'Defeating Jafar', 'Aladdin outsmarts the villain', 1, 9, 16, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 29500),
  ((SELECT id FROM public.kids_shows WHERE title = 'Aladdin'), 'The Genies Freedom', 'Aladdin frees the Genie', 1, 10, 14, 'https://www.youtube.com/watch?v=G7_vwzuOa4M', 'https://img.youtube.com/vi/G7_vwzuOa4M/maxresdefault.jpg', false, 31000)
) AS episodes(id, title, description, season, episode, duration_mins, video_url, thumbnail_url, is_premium, views);