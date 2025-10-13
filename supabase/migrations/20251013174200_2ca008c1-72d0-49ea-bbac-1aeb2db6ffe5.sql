-- Translate remaining Slovak difficulty levels
UPDATE recipes SET difficulty = 'Easy' WHERE difficulty = 'Ľahká';
UPDATE recipes SET difficulty = 'Medium' WHERE difficulty = 'Stredná';
UPDATE recipes SET difficulty = 'Hard' WHERE difficulty = 'Náročná';

-- Translate description patterns from Slovak to English
UPDATE recipes 
SET description = REPLACE(description, 'Chutný recept', 'Delicious recipe')
WHERE description LIKE '%Chutný recept%';

UPDATE recipes 
SET description = REPLACE(description, 'z kategórie', 'from category')
WHERE description LIKE '%z kategórie%';

UPDATE recipes 
SET description = REPLACE(description, 'Kuchyňa:', 'Cuisine:')
WHERE description LIKE '%Kuchyňa:%';