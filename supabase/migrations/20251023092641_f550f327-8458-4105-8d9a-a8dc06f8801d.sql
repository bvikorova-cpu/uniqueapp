-- Update mystery box descriptions to English
UPDATE mystery_boxes 
SET description = 'A basic mystery box with random collectibles. Good chance for common and uncommon items.'
WHERE price = 100;

UPDATE mystery_boxes 
SET description = 'A premium mystery box with better odds. Higher chance for rare and epic items.'
WHERE price = 250;

UPDATE mystery_boxes 
SET description = 'An exclusive mystery box with guaranteed epic or legendary items. Best odds for rare collectibles.'
WHERE price = 500;