-- Add 4 rooms to Cinderella Castle (Walt Disney World)
-- First, let's get the castle_id for Cinderella Castle

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
WHERE disney_castles.name = 'Cinderella Castle (Walt Disney World)';