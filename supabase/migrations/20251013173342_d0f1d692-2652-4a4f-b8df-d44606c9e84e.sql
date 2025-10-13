-- Translate existing recipe categories from Slovak to English
UPDATE recipes SET category = 'All' WHERE category = 'Všetko';
UPDATE recipes SET category = 'Appetizers' WHERE category = 'Predjedlá';
UPDATE recipes SET category = 'Main Dishes' WHERE category = 'Hlavné jedlá';
UPDATE recipes SET category = 'Desserts' WHERE category = 'Dezerty';
UPDATE recipes SET category = 'Soups' WHERE category = 'Polievky';
UPDATE recipes SET category = 'Salads' WHERE category = 'Šaláty';
UPDATE recipes SET category = 'Pasta' WHERE category = 'Cestoviny';
UPDATE recipes SET category = 'Pizza' WHERE category = 'Pizza';
UPDATE recipes SET category = 'Pastries' WHERE category = 'Múčniky';
UPDATE recipes SET category = 'Drinks' WHERE category = 'Nápoje';
UPDATE recipes SET category = 'Vegetarian' WHERE category = 'Vegetariánske';
UPDATE recipes SET category = 'Vegan' WHERE category = 'Vegánske';
UPDATE recipes SET category = 'Gluten-Free' WHERE category = 'Bezlepkové';
UPDATE recipes SET category = 'Fitness' WHERE category = 'Fitness';

-- Translate existing recipe difficulty levels from Slovak to English
UPDATE recipes SET difficulty = 'Easy' WHERE difficulty = 'Ľahké';
UPDATE recipes SET difficulty = 'Medium' WHERE difficulty = 'Stredné';
UPDATE recipes SET difficulty = 'Hard' WHERE difficulty = 'Náročné';