-- Pridaj nové Disney a Pixar rozprávky
INSERT INTO public.kids_shows (title, description, category, age_rating, is_premium) VALUES
('Moana', 'Dobrodružstvo ostrovnej princeznej na oceáne', 'Disney', '6+', false),
('Tangled', 'Príbeh Rapunzel a jej dlhých vlasov', 'Disney', '6+', false),
('Beauty and the Beast', 'Krásavica a zviera - klasický príbeh', 'Disney', '6+', false),
('Aladdin', 'Dobrodružstvo s čarovnou lampou', 'Disney', '6+', false),
('The Little Mermaid', 'Morská panna Ariel a jej sen', 'Disney', '6+', false),
('Mulan', 'Odvážna čínska bojovníčka', 'Disney', '6+', false),
('Pocahontas', 'Princezná a príroda', 'Disney', '6+', false),
('Cinderella', 'Popoluškin príbeh', 'Disney', '3+', false),
('Snow White', 'Snehulienka a sedem trpaslíkov', 'Disney', '3+', false),
('Sleeping Beauty', 'Šípková Ruženka', 'Disney', '3+', false),
('The Princess and the Frog', 'Princezná a žaba', 'Disney', '6+', false),
('Wreck-It Ralph', 'Ralph búra všetko', 'Disney', '6+', false),
('Big Hero 6', 'Veľká šestka hrdinov', 'Disney', '6+', false),
('Zootopia', 'Mesto zvierat', 'Disney', '6+', false),
('Encanto', 'Magický dom rodiny Madrigal', 'Disney', '6+', false),
('Raya and the Last Dragon', 'Raya a posledný drak', 'Disney', '6+', false),
('Hercules', 'Grécky hrdina Herkules', 'Disney', '6+', false),
('Tarzan', 'Chlapec vychovaný opicami', 'Disney', '6+', false),
('The Hunchback of Notre Dame', 'Zvonár z Notre Dame', 'Disney', '9+', false),
('Atlantis', 'Stratené kráľovstvo Atlantída', 'Disney', '9+', false),
('Treasure Planet', 'Planéta pokladov', 'Disney', '9+', false),
('Brother Bear', 'Medvedí brat', 'Disney', '6+', false),
('The Emperor''s New Groove', 'Cisárov nový šat', 'Disney', '6+', false),
('Lilo & Stitch', 'Lilo a Stitch', 'Disney', '6+', false),
('Meet the Robinsons', 'Stretnutie s Robinsonovcami', 'Disney', '6+', false),
('Bolt', 'Pes Bolt', 'Disney', '6+', false),
('Winnie the Pooh', 'Macko Pú', 'Disney', '3+', false),
('Dumbo', 'Sloník Dumbo', 'Disney', '3+', false),
('Bambi', 'Malé jeleňa Bambi', 'Disney', '3+', false),
('Alice in Wonderland', 'Alica v krajine zázrakov', 'Disney', '6+', false),
('Peter Pan', 'Peter Pan a Nezemianska', 'Disney', '6+', false),
('Lady and the Tramp', 'Lady a Tramp', 'Disney', '6+', false),
('101 Dalmatians', '101 dalmatíncov', 'Disney', '6+', false),
('The Jungle Book', 'Kniha džunglí', 'Disney', '6+', false),
('The Aristocats', 'Aristokratky', 'Disney', '6+', false),
('Robin Hood', 'Robin Hood', 'Disney', '6+', false),
('The Rescuers', 'Záchranári', 'Disney', '6+', false),
('The Fox and the Hound', 'Líška a pes', 'Disney', '6+', false),
('Oliver & Company', 'Oliver a spoločnosť', 'Disney', '6+', false),
('Toy Story', 'Príbeh hračiek', 'Pixar', '3+', false),
('A Bug''s Life', 'Život chrobáčikov', 'Pixar', '3+', false),
('Monsters Inc', 'Príšerky s.r.o.', 'Pixar', '6+', false),
('Finding Nemo', 'Hľadá sa Nemo', 'Pixar', '3+', false),
('The Incredibles', 'Úžasňákovi', 'Pixar', '6+', false),
('Cars', 'Autá', 'Pixar', '3+', false),
('Ratatouille', 'Ratatuj', 'Pixar', '6+', false),
('WALL-E', 'WALL-E', 'Pixar', '6+', false),
('Up', 'Hore', 'Pixar', '6+', false),
('Inside Out', 'V hlave', 'Pixar', '6+', false),
('Coco', 'Coco', 'Pixar', '6+', false),
('Finding Dory', 'Hľadá sa Dory', 'Pixar', '3+', false),
('Cars 2', 'Autá 2', 'Pixar', '6+', false),
('Cars 3', 'Autá 3', 'Pixar', '6+', false),
('Monsters University', 'Príšerky na univerzite', 'Pixar', '6+', false),
('The Good Dinosaur', 'Dobrý dinosaurus', 'Pixar', '6+', false),
('Toy Story 2', 'Príbeh hračiek 2', 'Pixar', '3+', false),
('Toy Story 3', 'Príbeh hračiek 3', 'Pixar', '6+', false),
('Toy Story 4', 'Príbeh hračiek 4', 'Pixar', '6+', false),
('Incredibles 2', 'Úžasňákovi 2', 'Pixar', '6+', false),
('Inside Out 2', 'V hlave 2', 'Pixar', '6+', false),
('Turning Red', 'Červená', 'Pixar', '9+', false),
('Luca', 'Luca', 'Pixar', '6+', false),
('Soul', 'Duša', 'Pixar', '9+', false),
('Onward', 'Dopredu', 'Pixar', '6+', false),
('Ralph Breaks the Internet', 'Ralph búra internet', 'Disney', '6+', false),
('Strange World', 'Podivný svet', 'Disney', '9+', false),
('Wish', 'Želanie', 'Disney', '6+', false),
('Elemental', 'Živel', 'Pixar', '6+', false);

-- Pridaj epizódy pre každú rozprávku (5 epizód pre každú)
INSERT INTO public.kids_episodes (show_id, title, episode_number, season_number, duration_minutes, video_url, thumbnail_url) 
SELECT id, 'Epizóda 1', 1, 1, 25, 'https://www.youtube.com/watch?v=xKyGF6tMt3M', 'https://img.youtube.com/vi/xKyGF6tMt3M/maxresdefault.jpg' FROM public.kids_shows WHERE title IN ('Moana', 'Tangled', 'Beauty and the Beast', 'Aladdin', 'The Little Mermaid', 'Mulan', 'Pocahontas', 'Cinderella', 'Snow White', 'Sleeping Beauty', 'The Princess and the Frog', 'Wreck-It Ralph', 'Big Hero 6', 'Zootopia', 'Encanto', 'Raya and the Last Dragon', 'Hercules', 'Tarzan', 'The Hunchback of Notre Dame', 'Atlantis', 'Treasure Planet', 'Brother Bear', 'The Emperor''s New Groove', 'Lilo & Stitch', 'Meet the Robinsons', 'Bolt', 'Winnie the Pooh', 'Dumbo', 'Bambi', 'Alice in Wonderland', 'Peter Pan', 'Lady and the Tramp', '101 Dalmatians', 'The Jungle Book', 'The Aristocats', 'Robin Hood', 'The Rescuers', 'The Fox and the Hound', 'Oliver & Company', 'Toy Story', 'A Bug''s Life', 'Monsters Inc', 'Finding Nemo', 'The Incredibles', 'Cars', 'Ratatouille', 'WALL-E', 'Up', 'Inside Out', 'Coco', 'Finding Dory', 'Cars 2', 'Cars 3', 'Monsters University', 'The Good Dinosaur', 'Toy Story 2', 'Toy Story 3', 'Toy Story 4', 'Incredibles 2', 'Inside Out 2', 'Turning Red', 'Luca', 'Soul', 'Onward', 'Ralph Breaks the Internet', 'Strange World', 'Wish', 'Elemental');

INSERT INTO public.kids_episodes (show_id, title, episode_number, season_number, duration_minutes, video_url, thumbnail_url) 
SELECT id, 'Epizóda 2', 2, 1, 25, 'https://www.youtube.com/watch?v=8T902UjW_FQ', 'https://img.youtube.com/vi/8T902UjW_FQ/maxresdefault.jpg' FROM public.kids_shows WHERE title IN ('Moana', 'Tangled', 'Beauty and the Beast', 'Aladdin', 'The Little Mermaid', 'Mulan', 'Pocahontas', 'Cinderella', 'Snow White', 'Sleeping Beauty', 'The Princess and the Frog', 'Wreck-It Ralph', 'Big Hero 6', 'Zootopia', 'Encanto', 'Raya and the Last Dragon', 'Hercules', 'Tarzan', 'The Hunchback of Notre Dame', 'Atlantis', 'Treasure Planet', 'Brother Bear', 'The Emperor''s New Groove', 'Lilo & Stitch', 'Meet the Robinsons', 'Bolt', 'Winnie the Pooh', 'Dumbo', 'Bambi', 'Alice in Wonderland', 'Peter Pan', 'Lady and the Tramp', '101 Dalmatians', 'The Jungle Book', 'The Aristocats', 'Robin Hood', 'The Rescuers', 'The Fox and the Hound', 'Oliver & Company', 'Toy Story', 'A Bug''s Life', 'Monsters Inc', 'Finding Nemo', 'The Incredibles', 'Cars', 'Ratatouille', 'WALL-E', 'Up', 'Inside Out', 'Coco', 'Finding Dory', 'Cars 2', 'Cars 3', 'Monsters University', 'The Good Dinosaur', 'Toy Story 2', 'Toy Story 3', 'Toy Story 4', 'Incredibles 2', 'Inside Out 2', 'Turning Red', 'Luca', 'Soul', 'Onward', 'Ralph Breaks the Internet', 'Strange World', 'Wish', 'Elemental');

INSERT INTO public.kids_episodes (show_id, title, episode_number, season_number, duration_minutes, video_url, thumbnail_url) 
SELECT id, 'Epizóda 3', 3, 1, 25, 'https://www.youtube.com/watch?v=zVKavW7LNqM', 'https://img.youtube.com/vi/zVKavW7LNqM/maxresdefault.jpg' FROM public.kids_shows WHERE title IN ('Moana', 'Tangled', 'Beauty and the Beast', 'Aladdin', 'The Little Mermaid', 'Mulan', 'Pocahontas', 'Cinderella', 'Snow White', 'Sleeping Beauty', 'The Princess and the Frog', 'Wreck-It Ralph', 'Big Hero 6', 'Zootopia', 'Encanto', 'Raya and the Last Dragon', 'Hercules', 'Tarzan', 'The Hunchback of Notre Dame', 'Atlantis', 'Treasure Planet', 'Brother Bear', 'The Emperor''s New Groove', 'Lilo & Stitch', 'Meet the Robinsons', 'Bolt', 'Winnie the Pooh', 'Dumbo', 'Bambi', 'Alice in Wonderland', 'Peter Pan', 'Lady and the Tramp', '101 Dalmatians', 'The Jungle Book', 'The Aristocats', 'Robin Hood', 'The Rescuers', 'The Fox and the Hound', 'Oliver & Company', 'Toy Story', 'A Bug''s Life', 'Monsters Inc', 'Finding Nemo', 'The Incredibles', 'Cars', 'Ratatouille', 'WALL-E', 'Up', 'Inside Out', 'Coco', 'Finding Dory', 'Cars 2', 'Cars 3', 'Monsters University', 'The Good Dinosaur', 'Toy Story 2', 'Toy Story 3', 'Toy Story 4', 'Incredibles 2', 'Inside Out 2', 'Turning Red', 'Luca', 'Soul', 'Onward', 'Ralph Breaks the Internet', 'Strange World', 'Wish', 'Elemental');

INSERT INTO public.kids_episodes (show_id, title, episode_number, season_number, duration_minutes, video_url, thumbnail_url) 
SELECT id, 'Epizóda 4', 4, 1, 25, 'https://www.youtube.com/watch?v=lFzVJEksoDY', 'https://img.youtube.com/vi/lFzVJEksoDY/maxresdefault.jpg' FROM public.kids_shows WHERE title IN ('Moana', 'Tangled', 'Beauty and the Beast', 'Aladdin', 'The Little Mermaid', 'Mulan', 'Pocahontas', 'Cinderella', 'Snow White', 'Sleeping Beauty', 'The Princess and the Frog', 'Wreck-It Ralph', 'Big Hero 6', 'Zootopia', 'Encanto', 'Raya and the Last Dragon', 'Hercules', 'Tarzan', 'The Hunchback of Notre Dame', 'Atlantis', 'Treasure Planet', 'Brother Bear', 'The Emperor''s New Groove', 'Lilo & Stitch', 'Meet the Robinsons', 'Bolt', 'Winnie the Pooh', 'Dumbo', 'Bambi', 'Alice in Wonderland', 'Peter Pan', 'Lady and the Tramp', '101 Dalmatians', 'The Jungle Book', 'The Aristocats', 'Robin Hood', 'The Rescuers', 'The Fox and the Hound', 'Oliver & Company', 'Toy Story', 'A Bug''s Life', 'Monsters Inc', 'Finding Nemo', 'The Incredibles', 'Cars', 'Ratatouille', 'WALL-E', 'Up', 'Inside Out', 'Coco', 'Finding Dory', 'Cars 2', 'Cars 3', 'Monsters University', 'The Good Dinosaur', 'Toy Story 2', 'Toy Story 3', 'Toy Story 4', 'Incredibles 2', 'Inside Out 2', 'Turning Red', 'Luca', 'Soul', 'Onward', 'Ralph Breaks the Internet', 'Strange World', 'Wish', 'Elemental');

INSERT INTO public.kids_episodes (show_id, title, episode_number, season_number, duration_minutes, video_url, thumbnail_url) 
SELECT id, 'Epizóda 5', 5, 1, 25, 'https://www.youtube.com/watch?v=8B8jplhrlso', 'https://img.youtube.com/vi/8B8jplhrlso/maxresdefault.jpg' FROM public.kids_shows WHERE title IN ('Moana', 'Tangled', 'Beauty and the Beast', 'Aladdin', 'The Little Mermaid', 'Mulan', 'Pocahontas', 'Cinderella', 'Snow White', 'Sleeping Beauty', 'The Princess and the Frog', 'Wreck-It Ralph', 'Big Hero 6', 'Zootopia', 'Encanto', 'Raya and the Last Dragon', 'Hercules', 'Tarzan', 'The Hunchback of Notre Dame', 'Atlantis', 'Treasure Planet', 'Brother Bear', 'The Emperor''s New Groove', 'Lilo & Stitch', 'Meet the Robinsons', 'Bolt', 'Winnie the Pooh', 'Dumbo', 'Bambi', 'Alice in Wonderland', 'Peter Pan', 'Lady and the Tramp', '101 Dalmatians', 'The Jungle Book', 'The Aristocats', 'Robin Hood', 'The Rescuers', 'The Fox and the Hound', 'Oliver & Company', 'Toy Story', 'A Bug''s Life', 'Monsters Inc', 'Finding Nemo', 'The Incredibles', 'Cars', 'Ratatouille', 'WALL-E', 'Up', 'Inside Out', 'Coco', 'Finding Dory', 'Cars 2', 'Cars 3', 'Monsters University', 'The Good Dinosaur', 'Toy Story 2', 'Toy Story 3', 'Toy Story 4', 'Incredibles 2', 'Inside Out 2', 'Turning Red', 'Luca', 'Soul', 'Onward', 'Ralph Breaks the Internet', 'Strange World', 'Wish', 'Elemental');