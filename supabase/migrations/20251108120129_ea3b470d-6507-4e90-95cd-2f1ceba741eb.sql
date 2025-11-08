-- Update existing rooms with new high-quality panoramas
UPDATE disney_castle_rooms 
SET panorama_url = 'stained-glass-gallery',
    description = 'A magnificent gallery featuring beautiful stained glass windows depicting classic Disney fairy tales, with ethereal light streaming through colored glass'
WHERE id = '7e8f56e3-38f8-4893-ba0b-cbf18dc7fd7f';

UPDATE disney_castle_rooms 
SET panorama_url = 'dragon-cave',
    description = 'A mystical cave beneath the castle where a friendly dragon sleeps, surrounded by glowing crystals and ancient Celtic patterns'
WHERE id = 'd95ab185-d816-4d3a-a9d7-f3761a4fa4da';

UPDATE disney_castle_rooms 
SET panorama_url = 'royal-chapel',
    description = 'A serene gothic chapel with stunning stained glass windows, white marble altar, and warm candlelight creating a peaceful atmosphere'
WHERE id = '07ad59a4-38a8-42e6-9df1-2420b9c915dc';

UPDATE disney_castle_rooms 
SET panorama_url = 'tapestry-hall',
    description = 'A grand hall adorned with large medieval tapestries depicting brave knights and beautiful princesses in their legendary adventures'
WHERE id = '8bfff267-f1e8-4247-b1b7-d4c11d5bbb8c';

-- Add new rooms to the Castle of Magical Dreams
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index, audio_guide_text)
VALUES 
  ('f67e89fa-2a35-4ed2-a598-d8378d3899e6', 'Enchanted Garden', 'A magical outdoor garden with blooming roses, sparkling fountains, topiary animals, and colorful butterflies dancing in the sunshine', 'enchanted-garden', 6, 'Welcome to the Enchanted Garden! This magical place is where all the Disney princesses love to spend their time. Can you spot the topiary animals? Look at those beautiful roses in every color of the rainbow!'),
  
  ('f67e89fa-2a35-4ed2-a598-d8378d3899e6', 'Royal Library', 'The magnificent royal library filled with thousands of magical books, golden ladders, and cozy reading nooks - Belle''s favorite place!', 'royal-library', 7, 'This is the Royal Library, where Belle loves to read! There are thousands of magical books here. Some books tell stories of far-away lands, others contain ancient spells. Which book would you like to read?'),
  
  ('f67e89fa-2a35-4ed2-a598-d8378d3899e6', 'Tower Room', 'A breathtaking tower room with panoramic windows offering stunning views of the kingdom, featuring a telescope for stargazing', 'tower-room', 8, 'Welcome to the Tower Room! Rapunzel loves coming here to paint and watch the stars. Look through the telescope to see the magical kingdom below. Can you see the floating lanterns in the distance?'),
  
  ('f67e89fa-2a35-4ed2-a598-d8378d3899e6', 'Grand Ballroom', 'The spectacular grand ballroom with crystal chandeliers, polished marble floors, and a magnificent staircase where magical balls take place', 'grand-ballroom', 9, 'You''ve entered the Grand Ballroom! This is where Cinderella danced with her Prince Charming. The crystal chandelier sparkles like a thousand stars, and the marble floor is so shiny you can see your reflection. Can you imagine dancing here?');