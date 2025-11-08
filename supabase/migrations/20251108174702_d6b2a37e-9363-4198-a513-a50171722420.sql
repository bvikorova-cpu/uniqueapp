-- Add missing rooms for Cinderella Castle (Walt Disney World)
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Royal Portrait Gallery', 'A gallery featuring portraits of all Disney princesses', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Walt Disney World';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Crystal Chamber', 'A magical room filled with sparkling crystals', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Walt Disney World';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Royal Library', 'An ancient library with magical storybooks', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Walt Disney World';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Tower Lookout', 'The highest point with views of the Magic Kingdom', '/placeholder.svg', 5
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Walt Disney World';

-- Add missing rooms for Tokyo Disney Resort
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Origami Garden', 'A magical garden with origami decorations', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disney Resort';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Tea Ceremony Room', 'Traditional Japanese tea room with Disney charm', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disney Resort';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Lantern Corridor', 'A hallway lit by hundreds of traditional lanterns', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disney Resort';

-- Add missing rooms for Disneyland Paris
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Dragon''s Lair', 'The legendary lair of Maleficent''s dragon beneath the castle', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant' AND park_name = 'Disneyland Paris';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Storybook Gallery', 'An enchanted gallery telling Sleeping Beauty''s story', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant' AND park_name = 'Disneyland Paris';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Spinning Wheel Chamber', 'The chamber containing the cursed spinning wheel', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant' AND park_name = 'Disneyland Paris';

-- Add missing rooms for Sleeping Beauty Castle (Disneyland Resort)
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Aurora''s Birthday Scene', 'The celebration room where the curse was cast', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Resort';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Forest of Thorns', 'The dark forest created by Maleficent''s curse', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Resort';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'True Love''s Kiss', 'The moment the curse was broken', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Resort';