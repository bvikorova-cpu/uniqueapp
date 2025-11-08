-- Update panorama URLs for all castle rooms

-- Castle of Magical Dreams (Hong Kong)
UPDATE disney_castle_rooms 
SET panorama_url = 'magical-dreams-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Castle of Magical Dreams' LIMIT 1)
AND order_index BETWEEN 1 AND 10;

-- Cinderella Castle (Magic Kingdom)
UPDATE disney_castle_rooms 
SET panorama_url = 'cinderella-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Magic Kingdom' LIMIT 1)
AND order_index BETWEEN 1 AND 10;

-- Sleeping Beauty Castle (Disneyland)
UPDATE disney_castle_rooms 
SET panorama_url = 'sleeping-beauty-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Sleeping Beauty Castle' LIMIT 1)
AND order_index BETWEEN 1 AND 10;

-- Le Château de la Belle au Bois Dormant (Paris)
UPDATE disney_castle_rooms 
SET panorama_url = 'paris-belle-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Le Château de la Belle au Bois Dormant' LIMIT 1)
AND order_index BETWEEN 1 AND 10;

-- Cinderella Castle (Tokyo)
UPDATE disney_castle_rooms 
SET panorama_url = 'tokyo-cinderella-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Cinderella Castle' AND park_name = 'Tokyo Disneyland' LIMIT 1)
AND order_index BETWEEN 1 AND 10;

-- Enchanted Storybook Castle (Shanghai)
UPDATE disney_castle_rooms 
SET panorama_url = 'shanghai-storybook-' || order_index
WHERE castle_id = (SELECT id FROM disney_castles WHERE name = 'Enchanted Storybook Castle' LIMIT 1)
AND order_index BETWEEN 1 AND 10;