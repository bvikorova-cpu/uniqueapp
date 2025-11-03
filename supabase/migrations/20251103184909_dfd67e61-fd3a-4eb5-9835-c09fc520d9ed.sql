-- Insert sample rooms for Disney castles
-- Cinderella Castle (Magic Kingdom) rooms
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Throne Room',
  'The majestic throne room where Disney princesses hold their royal celebrations',
  '/src/assets/disney/cinderella-throne.jpg',
  'Welcome to the magnificent throne room of Cinderella Castle! This grand hall has witnessed countless royal celebrations. Notice the beautiful royal blue carpet leading to the throne, and the crystal chandeliers that sparkle like magic above.',
  1
FROM public.disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Walt Disney World';

-- Sleeping Beauty Castle rooms
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Royal Ballroom',
  'An elegant ballroom where Princess Aurora danced with Prince Phillip',
  '/src/assets/disney/sleeping-beauty-ballroom.jpg',
  'Step into the enchanting ballroom where Princess Aurora met her true love! The romantic pink and gold decorations create a dreamy atmosphere. Can you imagine dancing here under the crystal chandeliers?',
  1
FROM public.disney_castles WHERE name = 'Sleeping Beauty Castle';

-- Paris Castle rooms  
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Enchanted Library',
  'A magical library filled with fairy tale books and secrets',
  '/src/assets/disney/paris-library.jpg',
  'Bienvenue to the magical library! This room holds secrets from all French fairy tales. Legend says that a friendly dragon guards the castle below. Look at all the enchanted books!',
  1
FROM public.disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant';

-- Hong Kong Castle rooms
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Princess Gallery',
  'A stunning hall celebrating 13 Disney princesses and heroines',
  '/src/assets/disney/hongkong-dreams.jpg',
  'Welcome to the Castle of Magical Dreams! This special hall celebrates 13 amazing Disney heroines. Each portrait tells a unique story of courage and kindness. Which princess is your favorite?',
  1
FROM public.disney_castles WHERE name = 'Castle of Magical Dreams';

-- Shanghai Castle rooms
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Grand Banquet Hall',
  'The tallest Disney castle features this spectacular banquet hall',
  '/src/assets/disney/shanghai-hall.jpg',
  'You are standing in the Grand Banquet Hall of the tallest Disney castle in the world! At 197 feet tall, this castle is truly spectacular. The Chinese architectural details blend perfectly with Disney magic.',
  1
FROM public.disney_castles WHERE name = 'Enchanted Storybook Castle';

-- Tokyo Castle rooms
INSERT INTO public.disney_castle_rooms (castle_id, room_name, description, panorama_url, audio_guide_text, order_index)
SELECT 
  id,
  'Cherry Blossom Court',
  'A beautiful hall decorated with Japanese cherry blossoms and Disney magic',
  '/src/assets/disney/tokyo-castle.jpg',
  'Konnichiwa! Welcome to Tokyo Disneyland''s Cinderella Castle! Notice the beautiful cherry blossom decorations that make this castle unique. During spring, the entire castle celebrates hanami season!',
  1
FROM public.disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disney Resort';