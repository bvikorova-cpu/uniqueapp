
-- Seed: extend Fairy Castles with 6 additional iconic castles + 4 rooms each
WITH new_castles AS (
  INSERT INTO public.fairy_castles (name, location, park_name, country_code, description, fun_facts, price_coins, is_premium, thumbnail_url)
  VALUES
    ('Neuschwanstein Castle', 'Bavaria', 'Alpine Fairytale Park', 'DE',
     'The cloud-piercing castle that inspired Sleeping Beauty.',
     ARRAY['Built by King Ludwig II in 1869','Inspired Walt Disney''s logo castle','Sits 200m above the Pöllat Gorge'],
     60, false, '/placeholder.svg'),
    ('Edinburgh Castle', 'Edinburgh', 'Royal Heritage Park', 'GB',
     'A volcanic-rock fortress guarding the Scottish crown jewels.',
     ARRAY['Stands on a 700-million-year-old volcano','Home to the Stone of Destiny','Fires the One O''Clock Gun daily'],
     55, false, '/placeholder.svg'),
    ('Bojnice Castle', 'Bojnice', 'Slovak Fairy Park', 'SK',
     'A romantic Slovak castle straight from a storybook.',
     ARRAY['First mentioned in 1113','Hosts an International Festival of Ghosts','Features a 700-year-old lime tree'],
     50, false, '/placeholder.svg'),
    ('Himeji Castle', 'Hyōgo', 'White Heron Park', 'JP',
     'The dazzling White Heron of Japan — a UNESCO masterpiece.',
     ARRAY['Survived WWII bombings untouched','Has 83 buildings and a maze defense','UNESCO World Heritage since 1993'],
     60, true, '/placeholder.svg'),
    ('Hohenzollern Castle', 'Baden-Württemberg', 'Misty Peaks Park', 'DE',
     'A mountain-top castle often floating above the clouds.',
     ARRAY['Sits 855m above sea level','Ancestral seat of Prussian royalty','Houses the crown of Wilhelm II'],
     55, false, '/placeholder.svg'),
    ('Prague Castle', 'Prague', 'Bohemian Crown Park', 'CZ',
     'The largest ancient castle complex in the world.',
     ARRAY['Founded around 880 AD','Covers nearly 70,000 m²','Home to the Czech Crown Jewels'],
     50, false, '/placeholder.svg')
  ON CONFLICT DO NOTHING
  RETURNING id, name
)
INSERT INTO public.fairy_castle_rooms (castle_id, room_name, description, audio_guide_text, order_index)
SELECT c.id, r.room_name, r.description, r.audio_guide_text, r.order_index
FROM new_castles c
CROSS JOIN LATERAL (
  VALUES
    ('Grand Entrance Hall', 'Step inside and feel the cool stone walls and towering ceilings.',
     'Welcome, explorer! You are standing in the grand entrance — listen closely and you might hear echoes of ancient footsteps.', 1),
    ('Throne Room', 'Where kings, queens and storybook royalty made their decrees.',
     'Sit tall like royalty — this is where the most important decisions of the realm were once made.', 2),
    ('Secret Library', 'Dusty tomes, magical scrolls and hidden passageways line every shelf.',
     'Shhh… many of these books haven''t been opened in centuries. Some say they whisper their stories at midnight.', 3),
    ('Tower Lookout', 'Climb the spiral stairs for a breathtaking view of the entire kingdom.',
     'You made it to the top! From here you can see the whole magical land stretching to the horizon.', 4)
) AS r(room_name, description, audio_guide_text, order_index);
