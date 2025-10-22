-- Aktualizuj všetky Peppa Pig epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=xKyGF6tMt3M',
  thumbnail_url = 'https://img.youtube.com/vi/xKyGF6tMt3M/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'Peppa Pig');

-- Aktualizuj všetky Paw Patrol epizódy  
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=8T902UjW_FQ',
  thumbnail_url = 'https://img.youtube.com/vi/8T902UjW_FQ/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'Paw Patrol');

-- Aktualizuj všetky Frozen epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=zVKavW7LNqM',
  thumbnail_url = 'https://img.youtube.com/vi/zVKavW7LNqM/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'Frozen');

-- Aktualizuj všetky Lion King epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=lFzVJEksoDY',
  thumbnail_url = 'https://img.youtube.com/vi/lFzVJEksoDY/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'The Lion King');

-- Aktualizuj všetky SpongeBob epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=8B8jplhrlso',
  thumbnail_url = 'https://img.youtube.com/vi/8B8jplhrlso/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'SpongeBob SquarePants');

-- Aktualizuj všetky Bluey epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=lFzVJEksoDY',
  thumbnail_url = 'https://img.youtube.com/vi/lFzVJEksoDY/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'Bluey');

-- Aktualizuj všetky Scooby-Doo epizódy
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=hx8I6hMKXE4',
  thumbnail_url = 'https://img.youtube.com/vi/hx8I6hMKXE4/maxresdefault.jpg'
WHERE show_id = (SELECT id FROM public.kids_shows WHERE title = 'Scooby-Doo');

-- Aktualizuj všetky ostatné epizódy ktoré majú NULL video_url
UPDATE public.kids_episodes
SET 
  video_url = 'https://www.youtube.com/watch?v=xKyGF6tMt3M',
  thumbnail_url = 'https://img.youtube.com/vi/xKyGF6tMt3M/maxresdefault.jpg'
WHERE video_url IS NULL OR thumbnail_url IS NULL;