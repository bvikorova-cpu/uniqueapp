-- Update kids shows with proper animated kids content
UPDATE kids_shows SET
  title = 'Prasiatko Peppa',
  description = 'Sleduj dobrodružstvá Peppy a jej rodiny v tejto roztomilej animovanej sérii',
  cover_image_url = 'https://images.unsplash.com/photo-1530651788726-1dbf58eeef1f?w=800',
  category = 'Animované',
  age_rating = '3+'
WHERE title = 'Magical Adventures';

UPDATE kids_shows SET
  title = 'Tlapková Patrola',
  description = 'Záchranárski psíkovia sú vždy pripravení pomôcť v Adventure Bay',
  cover_image_url = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
  category = 'Animované',
  age_rating = '3+'
WHERE title = 'Space Explorers';

UPDATE kids_shows SET
  title = 'Frozen Rozprávky',
  description = 'Magické príbehy z ľadového kráľovstva',
  cover_image_url = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800',
  category = 'Rozprávky',
  age_rating = '5+'
WHERE title = 'Ocean Friends';

UPDATE kids_shows SET
  title = 'Levie Kráľovstvo',
  description = 'Dobrodružstvá zvieratiek v africkej savane',
  cover_image_url = 'https://images.unsplash.com/photo-1556779659-2baa7deb0a1f?w=800',
  category = 'Zvieratká',
  age_rating = '4+'
WHERE title = 'Animal Kingdom';

UPDATE kids_shows SET
  title = 'Spievankovo',
  description = 'Detské pesničky a tanečky s roztomilými postavičkami',
  cover_image_url = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  category = 'Hudba',
  age_rating = '2+'
WHERE title = 'Music Time';

UPDATE kids_shows SET
  title = 'Rozprávkový Hrad',
  description = 'Klasické rozprávky v novom kabáte',
  cover_image_url = 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=800',
  category = 'Rozprávky',
  age_rating = '5+'
WHERE title = 'Fairy Tales';

-- Update episodes with real YouTube videos for kids
UPDATE kids_episodes SET
  title = 'Prasiatko ide do škôlky',
  description = 'Peppa má prvý deň v škôlke',
  video_url = 'https://www.youtube.com/embed/gXlfXirQF3A',
  thumbnail_url = 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=400'
WHERE episode_number = 1 AND show_id = (SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa');

UPDATE kids_episodes SET
  title = 'Narodeninová oslava',
  description = 'Peppa má narodeniny a pozve všetkých priateľov',
  video_url = 'https://www.youtube.com/embed/jil0WCh_UoQ',
  thumbnail_url = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400'
WHERE episode_number = 2 AND show_id = (SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa');

UPDATE kids_episodes SET
  title = 'Záchrana mačičky',
  description = 'Tlapková patrola zachraňuje mačičku zo stromu',
  video_url = 'https://www.youtube.com/embed/N4BKVFHPLjM',
  thumbnail_url = 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'
WHERE episode_number = 3 AND show_id = (SELECT id FROM kids_shows WHERE title = 'Prasiatko Peppa');