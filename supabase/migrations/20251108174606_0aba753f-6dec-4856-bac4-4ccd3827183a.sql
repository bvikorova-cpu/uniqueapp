-- Delete duplicate rooms using ROW_NUMBER
DELETE FROM disney_castle_rooms
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY castle_id ORDER BY created_at) as rn
    FROM disney_castle_rooms
  ) t
  WHERE rn > 1
);

-- Now add unique rooms for each castle
-- Cinderella Castle (Magic Kingdom) - 5 unique rooms total
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Royal Portrait Gallery', 'A gallery featuring portraits of all Disney princesses', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Magic Kingdom';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Crystal Chamber', 'A magical room filled with sparkling crystals', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Magic Kingdom';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Royal Library', 'An ancient library with magical storybooks', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Magic Kingdom';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Tower Lookout', 'The highest point with views of the Magic Kingdom', '/placeholder.svg', 5
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Magic Kingdom';

-- Tokyo Disneyland - 4 unique rooms
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Origami Garden', 'A magical garden with origami decorations', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Tea Ceremony Room', 'Traditional Japanese tea room with Disney charm', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Lantern Corridor', 'A hallway lit by hundreds of traditional lanterns', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disneyland';

-- Disneyland Paris - 4 unique rooms
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Storybook Gallery', 'An enchanted gallery telling Sleeping Beauty''s story', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Paris';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Enchanted Forest Room', 'A magical forest with sparkling lights', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Paris';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Spinning Wheel Chamber', 'The chamber containing the cursed spinning wheel', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland Paris';

-- Hong Kong Disneyland - 4 unique rooms
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Mulan''s Courage Tower', 'A tower dedicated to the brave warrior Mulan', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Castle of Magical Dreams' AND park_name = 'Hong Kong Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Rapunzel''s Art Studio', 'A creative space filled with Rapunzel''s paintings', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Castle of Magical Dreams' AND park_name = 'Hong Kong Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Tiana''s Kitchen', 'A magical kitchen where dreams come true', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Castle of Magical Dreams' AND park_name = 'Hong Kong Disneyland';

-- Shanghai Disneyland - 4 unique rooms
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Snow White''s Wishing Well', 'A magical well where wishes come true', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Enchanted Storybook Castle' AND park_name = 'Shanghai Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Belle''s Library', 'A magnificent library filled with enchanted books', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Enchanted Storybook Castle' AND park_name = 'Shanghai Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Merida''s Archery Range', 'A Scottish-inspired archery training ground', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Enchanted Storybook Castle' AND park_name = 'Shanghai Disneyland';

-- Disneyland California - 4 unique rooms
INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Aurora''s Birthday Scene', 'The celebration room where the curse was cast', '/placeholder.svg', 2
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'Forest of Thorns', 'The dark forest created by Maleficent''s curse', '/placeholder.svg', 3
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland';

INSERT INTO disney_castle_rooms (castle_id, room_name, description, panorama_url, order_index)
SELECT id, 'True Love''s Kiss', 'The moment the curse was broken', '/placeholder.svg', 4
FROM disney_castles WHERE name = 'Sleeping Beauty Castle' AND park_name = 'Disneyland';