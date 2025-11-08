-- Add 4 rooms to the correct Cinderella Castle (Walt Disney World)
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT 
  id,
  room_data.name,
  room_data.description,
  room_data.order_idx
FROM disney_castles,
LATERAL (VALUES
  ('Royal Ballroom', 'The magnificent Grand Ballroom where Cinderella danced with Prince Charming, featuring stunning chandeliers and marble floors', 1),
  ('Fairy Godmother''s Workshop', 'A magical chamber filled with sparkling wands, spell books, and enchanted transformation mirrors', 2),
  ('Glass Slipper Gallery', 'An elegant display room showcasing the legendary glass slipper and Cinderella''s royal gowns', 3),
  ('Royal Throne Room', 'The majestic throne room of the kingdom with golden thrones, royal banners, and a view of the castle gardens', 4)
) AS room_data(name, description, order_idx)
WHERE disney_castles.park_name = 'Walt Disney World';

-- Enable RLS on disney_castle_rooms
ALTER TABLE disney_castle_rooms ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Disney castle rooms are publicly readable" ON disney_castle_rooms;
CREATE POLICY "Disney castle rooms are publicly readable"
ON disney_castle_rooms
FOR SELECT
TO public
USING (true);

-- Drop existing policy if it exists and create new one for castles
DROP POLICY IF EXISTS "Disney castles are publicly readable" ON disney_castles;
CREATE POLICY "Disney castles are publicly readable"
ON disney_castles
FOR SELECT
TO public
USING (true);