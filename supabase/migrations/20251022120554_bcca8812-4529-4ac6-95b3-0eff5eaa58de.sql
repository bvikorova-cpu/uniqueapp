-- Remove specific shows from kids_shows table
DELETE FROM kids_shows WHERE title IN (
  'Coco',
  'Cars 2',
  'Cars 3',
  'The Good Dinosaur',
  'Toy Story 2',
  'Toy Story 3',
  'Toy Story 4',
  'Incredibles 2'
);