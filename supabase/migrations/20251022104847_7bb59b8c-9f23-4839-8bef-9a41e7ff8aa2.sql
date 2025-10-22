-- Update show titles to English
UPDATE kids_shows SET 
  title = 'Peppa Pig',
  description = 'Peppa is a lovable little pig who lives with her brother George, Mummy Pig, and Daddy Pig. Peppa loves jumping in muddy puddles, playing with her friends, and going on new adventures.'
WHERE title = 'Prasiatko Peppa';

UPDATE kids_shows SET 
  title = 'Paw Patrol',
  description = 'PAW Patrol is a team of heroic puppies who are always ready to help! Ryder and his team of pups - Chase, Marshall, Rubble, Skye, Rocky, Zuma, and Everest rescue Adventure Bay from every problem.'
WHERE title = 'Tlapková Patrola';

UPDATE kids_shows SET 
  title = 'Frozen Stories',
  description = 'Step into the magical world of Frozen! Follow the adventures of Anna, Elsa, Olaf, and all their friends in the kingdom of Arendelle. Full of songs, magic, and friendship!'
WHERE title = 'Frozen Rozprávky';

UPDATE kids_shows SET 
  title = 'Lion Kingdom',
  description = 'Simba, a young lion, must learn to become king. Follow his adventures with friends Timon and Pumbaa in the African wilderness. Hakuna Matata!'
WHERE title = 'Levie Kráľovstvo';

UPDATE kids_shows SET 
  title = 'Music Time',
  description = 'The most beautiful songs for children. Sing along with us! Fun and educational musical adventures for little singers.'
WHERE title = 'Spievankovo';

UPDATE kids_shows SET 
  title = 'Fairy Tale Castle',
  description = 'Classic fairy tales from around the world. Princesses, heroes, and magical adventures await in the Fairy Tale Castle!'
WHERE title = 'Rozprávkový Hrad';

-- Update episode titles to English for Peppa Pig
UPDATE kids_episodes SET 
  title = 'Muddy Puddles',
  description = 'Peppa and George love jumping in muddy puddles! But first they must put on their boots.'
WHERE title = 'Blatiská';

UPDATE kids_episodes SET 
  title = 'Mr Dinosaur',
  description = 'George loves dinosaurs, especially his toy dinosaur. Grrr!'
WHERE title = 'Dinosaurus';

UPDATE kids_episodes SET 
  title = 'Best Friend',
  description = 'Peppa has a best friend, Suzy Sheep. They play together every day.'
WHERE title = 'Najlepší priateľ';

UPDATE kids_episodes SET 
  title = 'Daddy''s Glasses',
  description = 'Peppa and her family search for Daddy Pig''s glasses all over the house.'
WHERE title = 'Papučky';

UPDATE kids_episodes SET 
  title = 'Hide and Seek',
  description = 'Peppa and George play hide and seek. Peppa is great at seeking!'
WHERE title = 'Schovávačka';

UPDATE kids_episodes SET 
  title = 'The Garden',
  description = 'Grandpa Pig and Granny Pig have a beautiful garden full of vegetables.'
WHERE title = 'Záhrada';

UPDATE kids_episodes SET 
  title = 'Playgroup',
  description = 'Peppa goes to playgroup where she learns, sings, and plays with friends.'
WHERE title = 'Škôlka';

UPDATE kids_episodes SET 
  title = 'Picnic',
  description = 'The Pig family goes on a picnic. But they must watch out for the ants!'
WHERE title = 'Piknik';

UPDATE kids_episodes SET 
  title = 'Musical Instruments',
  description = 'Peppa and her friends learn to play musical instruments.'
WHERE title = 'Hudobné nástroje';

UPDATE kids_episodes SET 
  title = 'Fireflies',
  description = 'It''s night time and Peppa sees fireflies. What could they be?'
WHERE title = 'Svetielka';

UPDATE kids_episodes SET 
  title = 'Birthday Party',
  description = 'Peppa has a birthday and invites all her friends to the party!'
WHERE title = 'Narodeniny';

UPDATE kids_episodes SET 
  title = 'Beach Day',
  description = 'The family goes to the beach to build sandcastles.'
WHERE title = 'Pláž';

-- Update Paw Patrol episodes
UPDATE kids_episodes SET 
  title = 'Pups Save a Kitten',
  description = 'Chase and the team must rescue a kitten stuck in a tree. No rescue is too small!'
WHERE title = 'Šteniatka zachraňujú mačiatko';

UPDATE kids_episodes SET 
  title = 'Big Rescue Race',
  description = 'The pups compete in a race but must stop to help friends in need.'
WHERE title = 'Veľké záchranné preteky';

UPDATE kids_episodes SET 
  title = 'Marshall and the Fire',
  description = 'Marshall must be brave when a fire breaks out in Adventure Bay.'
WHERE title = 'Marshall a požiar';

UPDATE kids_episodes SET 
  title = 'Skye Flies High',
  description = 'Skye uses her helicopter for an aerial rescue mission.'
WHERE title = 'Skye lieta vysoko';

UPDATE kids_episodes SET 
  title = 'Rubble Digs Deep',
  description = 'Rubble and his digger must help rescue buried animals.'
WHERE title = 'Rubble kopie';

UPDATE kids_episodes SET 
  title = 'Zuma on the Water',
  description = 'Zuma uses his hovercraft for a water rescue mission.'
WHERE title = 'Zuma na vode';

UPDATE kids_episodes SET 
  title = 'Rocky Recycles',
  description = 'Rocky shows how important it is to recycle and protect nature.'
WHERE title = 'Rocky recykluje';

UPDATE kids_episodes SET 
  title = 'Everest in the Snow',
  description = 'Everest and Jake rescue friends during a snowstorm.'
WHERE title = 'Everest v snehu';

UPDATE kids_episodes SET 
  title = 'Night Patrol',
  description = 'The pups must rescue someone in the middle of the night!'
WHERE title = 'Nočná hliadka';

UPDATE kids_episodes SET 
  title = 'Ultimate Rescue',
  description = 'PAW Patrol''s biggest rescue mission ever!'
WHERE title = 'Veľkolepá záchrana';

-- Update Frozen episodes
UPDATE kids_episodes SET 
  title = 'Elsa''s Ice Magic',
  description = 'Elsa discovers her magical ability to create ice and snow.'
WHERE title = 'Elsina ľadová moc';

UPDATE kids_episodes SET 
  title = 'Anna and Elsa - Sisters Forever',
  description = 'Anna and Elsa learn the value of sisterly friendship.'
WHERE title = 'Anna a Elsa - sestry navždy';

UPDATE kids_episodes SET 
  title = 'Olaf''s Adventure',
  description = 'Olaf, the lovable snowman, experiences his first summer adventure.'
WHERE title = 'Olafovo dobrodružstvo';

UPDATE kids_episodes SET 
  title = 'Kristoff and Sven',
  description = 'Kristoff and his reindeer friend Sven help Anna find Elsa.'
WHERE title = 'Kristoff a Sven';

UPDATE kids_episodes SET 
  title = 'Let It Go',
  description = 'Elsa sings her famous song and builds an ice palace.'
WHERE title = 'Let It Go - Nech to plynie';

UPDATE kids_episodes SET 
  title = 'Arendelle Adventure',
  description = 'Explore the magical kingdom of Arendelle with Anna and Elsa.'
WHERE title = 'Arendellské dobrodružstvo';

-- Update Lion King episodes
UPDATE kids_episodes SET 
  title = 'Simba''s Story',
  description = 'A young lion cub named Simba is born as the future king of Pridelands.'
WHERE title = 'Simbov príbeh';

UPDATE kids_episodes SET 
  title = 'Hakuna Matata',
  description = 'Simba meets Timon and Pumbaa and learns to live worry-free.'
WHERE title = 'Hakuna Matata';

UPDATE kids_episodes SET 
  title = 'Return of the King',
  description = 'Simba returns to the Pridelands to claim his kingdom.'
WHERE title = 'Návrat kráľa';

UPDATE kids_episodes SET 
  title = 'Nala and Simba',
  description = 'Simba reunites with his childhood friend Nala.'
WHERE title = 'Nala a Simba';

UPDATE kids_episodes SET 
  title = 'Circle of Life',
  description = 'All the animals gather to celebrate the circle of life.'
WHERE title = 'Kruh života';

-- Update Music Time episodes
UPDATE kids_episodes SET 
  title = 'Kids Songs 1',
  description = 'The most beautiful songs for children. Sing with us!'
WHERE title = 'Detské pesničky 1';

UPDATE kids_episodes SET 
  title = 'Kids Songs 2',
  description = 'More beautiful songs for little singers.'
WHERE title = 'Detské pesničky 2';

UPDATE kids_episodes SET 
  title = 'Dance Songs',
  description = 'Songs that teach children to dance and move.'
WHERE title = 'Tanečné pesničky';

UPDATE kids_episodes SET 
  title = 'Animal Songs',
  description = 'Songs about animals that children love.'
WHERE title = 'Zvieratká v pesničkách';

UPDATE kids_episodes SET 
  title = 'Good Morning Songs',
  description = 'Songs for waking up with a good mood.'
WHERE title = 'Dobré ráno pesničky';

-- Update Fairy Tale Castle episodes
UPDATE kids_episodes SET 
  title = 'Goldilocks',
  description = 'A classic fairy tale about a princess with golden hair.'
WHERE title = 'Zlatovláska';

UPDATE kids_episodes SET 
  title = 'Cinderella',
  description = 'The story of a girl who became a princess.'
WHERE title = 'Popolvár';

UPDATE kids_episodes SET 
  title = 'Twelve Months',
  description = 'A folk tale about the twelve months of the year.'
WHERE title = 'O dvanástich mesiačikoch';

UPDATE kids_episodes SET 
  title = 'The Mill Princess',
  description = 'A tale of a brave princess and her adventures.'
WHERE title = 'Princezná zo mlyna';

UPDATE kids_episodes SET 
  title = 'Three Wishes for Cinderella',
  description = 'The most beautiful Christmas fairy tale of all time.'
WHERE title = 'Tri oriešky pre Popolušku';