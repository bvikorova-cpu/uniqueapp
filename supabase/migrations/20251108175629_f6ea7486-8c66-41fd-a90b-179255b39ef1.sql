-- First make panorama_url nullable
ALTER TABLE disney_castle_rooms ALTER COLUMN panorama_url DROP NOT NULL;

-- Delete all existing rooms to start fresh
DELETE FROM disney_castle_rooms;

-- Castle of Magical Dreams (Hong Kong) - Unique celebration of diverse Disney heroines
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Princess Gallery', 'A stunning hall celebrating 13 Disney princesses and heroines with individual alcoves for each', 1
FROM disney_castles WHERE name = 'Castle of Magical Dreams'
UNION ALL
SELECT id, 'Mulan''s Courage Tower', 'A tower dedicated to the brave warrior Mulan, featuring Chinese-inspired armor and battle artifacts', 2
FROM disney_castles WHERE name = 'Castle of Magical Dreams'
UNION ALL
SELECT id, 'Rapunzel''s Art Studio', 'A creative space filled with Rapunzel''s vibrant paintings, floating lanterns, and art supplies', 3
FROM disney_castles WHERE name = 'Castle of Magical Dreams'
UNION ALL
SELECT id, 'Tiana''s Kitchen', 'A magical New Orleans-style kitchen where culinary dreams come true, filled with cooking equipment and beignets', 4
FROM disney_castles WHERE name = 'Castle of Magical Dreams';

-- Cinderella Castle (Tokyo Disneyland) - Japanese-influenced magical castle
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Cherry Blossom Court', 'A beautiful hall decorated with Japanese cherry blossoms and Disney magic, featuring delicate pink petals', 1
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Tokyo Disneyland'
UNION ALL
SELECT id, 'Origami Garden', 'A magical indoor garden with intricate origami decorations shaped like Disney characters', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Tokyo Disneyland'
UNION ALL
SELECT id, 'Tea Ceremony Room', 'Traditional Japanese tea room blended with Disney charm, featuring elegant tea sets and cushions', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Tokyo Disneyland'
UNION ALL
SELECT id, 'Lantern Corridor', 'A mystical hallway illuminated by hundreds of traditional paper lanterns with magical glow', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Tokyo Disneyland';

-- Cinderella Castle (Walt Disney World) - Classic American fairy tale castle
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Throne Room', 'The majestic throne room where Cinderella holds royal celebrations, with golden decorations and red carpets', 1
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Magic Kingdom, Walt Disney World'
UNION ALL
SELECT id, 'Royal Portrait Gallery', 'A grand gallery featuring ornate portraits of Disney princesses in gilded frames', 2
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Magic Kingdom, Walt Disney World'
UNION ALL
SELECT id, 'Crystal Chamber', 'A magical room filled with sparkling crystals and glass slippers, reflecting rainbow lights', 3
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Magic Kingdom, Walt Disney World'
UNION ALL
SELECT id, 'Royal Library', 'An ancient library with leather-bound magical storybooks and cozy reading nooks', 4
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Magic Kingdom, Walt Disney World'
UNION ALL
SELECT id, 'Tower Lookout', 'The highest tower point offering breathtaking panoramic views of the Magic Kingdom', 5
FROM disney_castles WHERE name = 'Cinderella Castle' AND location = 'Magic Kingdom, Walt Disney World';

-- Enchanted Storybook Castle (Shanghai) - Tallest Disney castle with multiple princess stories
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Grand Banquet Hall', 'The spectacular banquet hall in the tallest Disney castle, with enormous chandeliers and elegant tables', 1
FROM disney_castles WHERE name = 'Enchanted Storybook Castle'
UNION ALL
SELECT id, 'Snow White''s Wishing Well', 'A magical indoor well where wishes echo with enchantment, surrounded by the Seven Dwarfs'' gems', 2
FROM disney_castles WHERE name = 'Enchanted Storybook Castle'
UNION ALL
SELECT id, 'Belle''s Library', 'A magnificent multi-story library with rolling ladders, filled with thousands of enchanted books', 3
FROM disney_castles WHERE name = 'Enchanted Storybook Castle'
UNION ALL
SELECT id, 'Merida''s Archery Range', 'A Scottish-inspired training ground with targets, bows, and Celtic decorations', 4
FROM disney_castles WHERE name = 'Enchanted Storybook Castle';

-- Le Château de la Belle au Bois Dormant (Disneyland Paris) - Dark fairy tale aesthetic
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Enchanted Library', 'A mysterious library filled with ancient fairy tale books, magical secrets, and glowing manuscripts', 1
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant'
UNION ALL
SELECT id, 'Dragon''s Lair', 'The legendary underground lair of Maleficent''s animatronic dragon, with dark caverns and treasures', 2
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant'
UNION ALL
SELECT id, 'Storybook Gallery', 'An enchanted gallery with stained glass and tapestries telling Sleeping Beauty''s story scene by scene', 3
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant'
UNION ALL
SELECT id, 'Spinning Wheel Chamber', 'The cursed chamber containing Maleficent''s enchanted spinning wheel that sealed Aurora''s fate', 4
FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant';

-- Sleeping Beauty Castle (Disneyland Resort California) - Original Disney castle, walkthrough attraction
INSERT INTO disney_castle_rooms (castle_id, room_name, description, order_index)
SELECT id, 'Royal Ballroom', 'An elegant ballroom where Princess Aurora danced with Prince Phillip, with romantic décor', 1
FROM disney_castles WHERE name = 'Sleeping Beauty Castle'
UNION ALL
SELECT id, 'Aurora''s Birthday Scene', 'The celebration room where the three good fairies prepared Aurora''s birthday surprise', 2
FROM disney_castles WHERE name = 'Sleeping Beauty Castle'
UNION ALL
SELECT id, 'Forest of Thorns', 'The dark, twisted forest created by Maleficent''s curse, with gnarled branches and eerie atmosphere', 3
FROM disney_castles WHERE name = 'Sleeping Beauty Castle'
UNION ALL
SELECT id, 'True Love''s Kiss', 'The tower chamber depicting the moment Prince Phillip''s kiss broke the sleeping curse', 4
FROM disney_castles WHERE name = 'Sleeping Beauty Castle';