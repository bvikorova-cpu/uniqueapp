-- Add 4 new popular kids shows
INSERT INTO kids_shows (title, description, category, age_rating, is_premium) VALUES
('Bluey', 'Bluey is an Australian animated series about a Blue Heeler puppy and her family. Join Bluey and Bingo as they explore their world through imaginative play and family adventures.', 'Adventure', '3+', false),
('Masha and the Bear', 'Masha is a curious little girl who befriends a gentle Bear. Together they have fun adventures in the forest, teaching kids about friendship, kindness, and creativity.', 'Comedy', '3+', false),
('Dora the Explorer', 'Join Dora on exciting adventures as she explores the world with her friends! Learn problem-solving, language skills, and geography in this interactive educational series.', 'Educational', '3+', false),
('Cocomelon', 'Cocomelon features fun nursery rhymes and educational songs for toddlers and preschoolers. Sing along and learn with JJ and his family!', 'Musical', '0+', false);

-- Insert 15 Bluey episodes
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Magic Xylophone', 'Bluey and Bingo find a magic xylophone that can freeze Dad!', 'https://www.youtube.com/embed/aP-qKaig84M', 7, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Hospital', 'Bluey and Bingo play hospital and give Dad a checkup.', 'https://www.youtube.com/embed/h6lqJcJdy2s', 7, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Keepy Uppy', 'Bluey tries to keep a balloon in the air without letting it touch the ground.', 'https://www.youtube.com/embed/Xw3-3jQQMBk', 7, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Daddy Robot', 'Bluey and Bingo transform Dad into a robot.', 'https://www.youtube.com/embed/e-qFb6Q1IcY', 7, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Shadowlands', 'Bluey and her friends play a game of shadows.', 'https://www.youtube.com/embed/aP-qKaig84M', 7, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'The Weekend', 'Bluey and Bingo have an amazing weekend adventure.', 'https://www.youtube.com/embed/h6lqJcJdy2s', 7, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'BBQ', 'At a family BBQ, Bluey shows off her new skill.', 'https://www.youtube.com/embed/Xw3-3jQQMBk', 7, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Fruit Bat', 'Bluey tries not to wake Dad who is napping.', 'https://www.youtube.com/embed/e-qFb6Q1IcY', 7, 8, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Grannies', 'Bluey and Bingo pretend to be grannies at a market.', 'https://www.youtube.com/embed/aP-qKaig84M', 7, 9, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'The Beach', 'The Heeler family goes to the beach for a perfect day.', 'https://www.youtube.com/embed/h6lqJcJdy2s', 7, 10, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Camping', 'Bluey makes a new friend while camping with her family.', 'https://www.youtube.com/embed/Xw3-3jQQMBk', 7, 11, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Dance Mode', 'Bluey and Bango dance with Mum and Dad.', 'https://www.youtube.com/embed/e-qFb6Q1IcY', 7, 12, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Baby Race', 'Mum tells a story about when Bluey was a baby.', 'https://www.youtube.com/embed/aP-qKaig84M', 7, 13, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Sleepytime', 'Bingo has an amazing dream adventure.', 'https://www.youtube.com/embed/h6lqJcJdy2s', 7, 14, 2, true),
((SELECT id FROM kids_shows WHERE title = 'Bluey'), 'Grandad', 'Bluey and Bingo visit Granddad for a special day.', 'https://www.youtube.com/embed/Xw3-3jQQMBk', 7, 15, 2, true);

-- Insert 15 Masha and the Bear episodes  
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'First Meeting', 'Masha meets Bear for the very first time!', 'https://www.youtube.com/embed/Pvqs5UhOS64', 7, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Recipe for Disaster', 'Masha tries to cook jam with hilarious results.', 'https://www.youtube.com/embed/ZAQdj529D7k', 7, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Hide and Seek', 'Masha and Bear play hide and seek in the forest.', 'https://www.youtube.com/embed/HQfWEgaLEME', 7, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Springtime for Bear', 'Masha helps Bear wake up from hibernation.', 'https://www.youtube.com/embed/2PrnBcJy42o', 7, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Tracks of Unknown Animals', 'Masha finds mysterious tracks in the snow.', 'https://www.youtube.com/embed/em_YbGbUX2w', 7, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Jam Day', 'Masha and Bear make jam together.', 'https://www.youtube.com/embed/Xybj-8ySRzs', 7, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Grand Piano Lesson', 'Masha learns to play the piano.', 'https://www.youtube.com/embed/Pvqs5UhOS64', 7, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Gone Fishing', 'Bear takes Masha on a fishing adventure.', 'https://www.youtube.com/embed/ZAQdj529D7k', 7, 8, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Call Me Please', 'Masha discovers Bear''s phone and has fun calling everyone.', 'https://www.youtube.com/embed/HQfWEgaLEME', 7, 9, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Holiday on Ice', 'Masha and Bear go ice skating.', 'https://www.youtube.com/embed/2PrnBcJy42o', 7, 10, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'One, Two, Three! Christmas Tree!', 'Masha and Bear celebrate the holidays.', 'https://www.youtube.com/embed/em_YbGbUX2w', 7, 11, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Home Improvement', 'Masha helps Bear renovate his house.', 'https://www.youtube.com/embed/Xybj-8ySRzs', 7, 12, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Picture Perfect', 'Masha becomes an artist and paints everything.', 'https://www.youtube.com/embed/Pvqs5UhOS64', 7, 13, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'The Magic Flute', 'Masha finds a magic flute with special powers.', 'https://www.youtube.com/embed/ZAQdj529D7k', 7, 14, 2, true),
((SELECT id FROM kids_shows WHERE title = 'Masha and the Bear'), 'Bon Appétit', 'Masha learns about healthy eating.', 'https://www.youtube.com/embed/HQfWEgaLEME', 7, 15, 2, true);

-- Insert 15 Dora the Explorer episodes
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'The Legend of the Big Red Chicken', 'Dora and Boots go on an adventure to help the Big Red Chicken.', 'https://www.youtube.com/embed/FZpJXVKtIj0', 22, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Lost and Found', 'Dora helps her friends find their lost items.', 'https://www.youtube.com/embed/VwOL7OaT2hA', 22, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Treasure Island', 'Dora and Boots search for pirate treasure.', 'https://www.youtube.com/embed/SrLy8uc7rQo', 22, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Save the Puppies', 'Dora rescues adorable lost puppies.', 'https://www.youtube.com/embed/vnjd0OTPZYA', 22, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Beaches', 'Dora and friends have fun at the beach.', 'https://www.youtube.com/embed/XT4OMiFB2hM', 22, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Fairytale Adventure', 'Dora enters a magical fairytale world.', 'https://www.youtube.com/embed/FGR20a9xRD8', 22, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Star Mountain', 'Dora climbs a mountain to catch a shooting star.', 'https://www.youtube.com/embed/FZpJXVKtIj0', 22, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'ABC Animals', 'Dora teaches about animals from A to Z.', 'https://www.youtube.com/embed/VwOL7OaT2hA', 22, 8, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Dora Saves the Mermaids', 'Dora helps mermaids in an underwater adventure.', 'https://www.youtube.com/embed/SrLy8uc7rQo', 22, 9, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Moonlight Adventure', 'Dora goes on a nighttime adventure under the moon.', 'https://www.youtube.com/embed/vnjd0OTPZYA', 22, 10, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'School Science Fair', 'Dora prepares an amazing project for the science fair.', 'https://www.youtube.com/embed/XT4OMiFB2hM', 22, 11, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Super Babies', 'Dora and friends become superhero babies.', 'https://www.youtube.com/embed/FGR20a9xRD8', 22, 12, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Crystal Kingdom', 'Dora visits a magical crystal kingdom.', 'https://www.youtube.com/embed/FZpJXVKtIj0', 22, 13, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'Dora Saves the Snow Princess', 'Dora helps rescue a princess from the Snow Witch.', 'https://www.youtube.com/embed/VwOL7OaT2hA', 22, 14, 2, true),
((SELECT id FROM kids_shows WHERE title = 'Dora the Explorer'), 'City of Lost Toys', 'Dora searches for toys in a mysterious city.', 'https://www.youtube.com/embed/SrLy8uc7rQo', 22, 15, 2, true);

-- Insert 15 Cocomelon episodes
INSERT INTO kids_episodes (show_id, title, description, video_url, duration_minutes, episode_number, season_number, is_premium) VALUES
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Wheels on the Bus', 'Sing along to the classic wheels on the bus song!', 'https://www.youtube.com/embed/e_04ZrNroTo', 3, 1, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Bath Song', 'JJ takes a fun bath with bubbles and toys.', 'https://www.youtube.com/embed/WRVsOCh907o', 3, 2, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'ABC Song', 'Learn the alphabet with JJ and friends!', 'https://www.youtube.com/embed/h4eueDYPTIg', 3, 3, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Bingo Dog Song', 'Sing about Bingo the dog in this fun song.', 'https://www.youtube.com/embed/9mmF8zOlh_g', 3, 4, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Yes Yes Vegetables', 'JJ learns to eat his vegetables.', 'https://www.youtube.com/embed/LsNuYWFe-hA', 3, 5, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Twinkle Twinkle Little Star', 'The classic lullaby with beautiful animation.', 'https://www.youtube.com/embed/yCjJyiqpAuU', 3, 6, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Nursery Rhyme Compilation', 'A collection of favorite nursery rhymes.', 'https://www.youtube.com/embed/Ss0kFNUP4P4', 30, 7, 1, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Happy Birthday Song', 'Celebrate birthdays with this fun song!', 'https://www.youtube.com/embed/ho08NLRGN9o', 3, 8, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Potty Training Song', 'JJ learns about potty training.', 'https://www.youtube.com/embed/79v73_PdYXo', 3, 9, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Bedtime Song', 'A soothing song to help little ones sleep.', 'https://www.youtube.com/embed/7VsK5dCZo70', 3, 10, 1, true),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Colors Song', 'Learn all the colors with JJ!', 'https://www.youtube.com/embed/tkpfg-jakKA', 3, 11, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Numbers Song', 'Count from 1 to 10 with fun animations.', 'https://www.youtube.com/embed/Dr3H7ZhK4Lc', 3, 12, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Old MacDonald', 'Old MacDonald has a farm with lots of animals!', 'https://www.youtube.com/embed/_6HzoUcx3eo', 3, 13, 2, false),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Head Shoulders Knees and Toes', 'Learn body parts with this active song.', 'https://www.youtube.com/embed/h4eueDYPTIg', 3, 14, 2, true),
((SELECT id FROM kids_shows WHERE title = 'Cocomelon'), 'Five Little Monkeys', 'Five little monkeys jumping on the bed!', 'https://www.youtube.com/embed/9mmF8zOlh_g', 3, 15, 2, true);