-- Add 20 new exotic pet types to the pet_types table

-- Exotic mammals
INSERT INTO pet_types (name, species, description, base_happiness, base_energy, base_hunger, is_premium, price, evolution_levels) VALUES
('Red Panda', 'red_panda', 'An adorable tree-dwelling mammal from the Himalayas', 50, 50, 50, true, 400, '[{"level": 5, "name": "Cub"}, {"level": 15, "name": "Red Panda"}, {"level": 30, "name": "Mystic Panda"}]'),
('Fennec Fox', 'fennec_fox', 'A tiny desert fox with enormous ears', 50, 50, 50, true, 350, '[{"level": 5, "name": "Kit"}, {"level": 15, "name": "Fennec Fox"}, {"level": 30, "name": "Desert Spirit"}]'),
('Axolotl', 'axolotl', 'A smiling aquatic salamander with regenerative powers', 50, 50, 50, true, 300, '[{"level": 5, "name": "Larva"}, {"level": 15, "name": "Axolotl"}, {"level": 30, "name": "Ancient Axolotl"}]'),
('Quokka', 'quokka', 'The world''s happiest marsupial from Australia', 60, 50, 50, false, NULL, '[{"level": 5, "name": "Joey"}, {"level": 15, "name": "Quokka"}, {"level": 30, "name": "Joyful Quokka"}]'),
('Sugar Glider', 'sugar_glider', 'A tiny gliding possum with big eyes', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Baby"}, {"level": 15, "name": "Sugar Glider"}, {"level": 30, "name": "Sky Glider"}]'),

-- Exotic birds
('Toucan', 'toucan', 'A tropical bird with a colorful oversized beak', 50, 50, 50, true, 380, '[{"level": 5, "name": "Chick"}, {"level": 15, "name": "Toucan"}, {"level": 30, "name": "Rainbow Toucan"}]'),
('Peacock', 'peacock', 'A magnificent bird with iridescent tail feathers', 50, 50, 50, true, 420, '[{"level": 5, "name": "Peachick"}, {"level": 15, "name": "Peacock"}, {"level": 30, "name": "Royal Peacock"}]'),
('Penguin', 'penguin', 'A charming flightless bird from Antarctica', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Chick"}, {"level": 15, "name": "Penguin"}, {"level": 30, "name": "Emperor Penguin"}]'),
('Owl', 'owl', 'A wise nocturnal hunter with rotating head', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Owlet"}, {"level": 15, "name": "Owl"}, {"level": 30, "name": "Ancient Owl"}]'),

-- Mythical/Fantasy creatures
('Griffin', 'griffin', 'A legendary creature with eagle head and lion body', 50, 50, 50, true, 800, '[{"level": 5, "name": "Hatchling"}, {"level": 15, "name": "Griffin"}, {"level": 30, "name": "Majestic Griffin"}]'),
('Kitsune', 'kitsune', 'A mystical nine-tailed fox from Japanese folklore', 50, 50, 50, true, 700, '[{"level": 5, "name": "Kit"}, {"level": 15, "name": "Kitsune"}, {"level": 30, "name": "Nine-Tailed Kitsune"}]'),
('Cerberus', 'cerberus', 'The legendary three-headed guardian dog', 50, 50, 50, true, 900, '[{"level": 5, "name": "Pup"}, {"level": 15, "name": "Cerberus"}, {"level": 30, "name": "Infernal Cerberus"}]'),

-- Exotic reptiles
('Chameleon', 'chameleon', 'A color-changing lizard with independent eyes', 50, 50, 50, true, 320, '[{"level": 5, "name": "Hatchling"}, {"level": 15, "name": "Chameleon"}, {"level": 30, "name": "Crystal Chameleon"}]'),
('Gecko', 'gecko', 'A small lizard with sticky feet and regenerating tail', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Hatchling"}, {"level": 15, "name": "Gecko"}, {"level": 30, "name": "Golden Gecko"}]'),

-- Marine creatures
('Dolphin', 'dolphin', 'An intelligent and playful marine mammal', 55, 50, 50, true, 450, '[{"level": 5, "name": "Calf"}, {"level": 15, "name": "Dolphin"}, {"level": 30, "name": "Cosmic Dolphin"}]'),
('Sea Turtle', 'sea_turtle', 'An ancient marine reptile with protective shell', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Hatchling"}, {"level": 15, "name": "Sea Turtle"}, {"level": 30, "name": "Ancient Turtle"}]'),
('Seahorse', 'seahorse', 'A unique fish with horse-like head and prehensile tail', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Fry"}, {"level": 15, "name": "Seahorse"}, {"level": 30, "name": "Majestic Seahorse"}]'),

-- Insects/Arthropods
('Butterfly', 'butterfly', 'A beautiful winged insect with vibrant colors', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Caterpillar"}, {"level": 15, "name": "Butterfly"}, {"level": 30, "name": "Celestial Butterfly"}]'),
('Ladybug', 'ladybug', 'A tiny beetle with distinctive spotted pattern', 50, 50, 50, false, NULL, '[{"level": 5, "name": "Larva"}, {"level": 15, "name": "Ladybug"}, {"level": 30, "name": "Lucky Ladybug"}]'),

-- Other exotic
('Sloth', 'sloth', 'A slow-moving tree dweller with a constant smile', 50, 40, 40, true, 360, '[{"level": 5, "name": "Baby"}, {"level": 15, "name": "Sloth"}, {"level": 30, "name": "Zen Sloth"}]');