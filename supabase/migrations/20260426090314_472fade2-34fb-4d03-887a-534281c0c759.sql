-- Phase 3a: Disney → FairyCastles rebrand (DB migration)
-- 1) Rename tables to remove "disney" prefix
ALTER TABLE public.disney_castles RENAME TO fairy_castles;
ALTER TABLE public.disney_castle_rooms RENAME TO fairy_castle_rooms;
ALTER TABLE public.disney_collectibles RENAME TO fairy_collectibles;

-- 2) Update castle names and park names to remove Disney trademarks
UPDATE public.fairy_castles SET name = 'Crystal Castle', park_name = 'Magic World Florida'
  WHERE id = '412e3a5a-2a6d-42d6-8ba1-5308b3c531a1';
UPDATE public.fairy_castles SET name = 'Rose Castle', park_name = 'Magic Resort California'
  WHERE id = '576c1dcc-1894-41a8-9686-ddb4546738aa';
UPDATE public.fairy_castles SET name = 'Royal Château', park_name = 'Enchanted Park Paris'
  WHERE id = '5c3e12f7-5869-4ef4-9918-084dd5f77e1f';
UPDATE public.fairy_castles SET name = 'Pearl Castle', park_name = 'Magic World Hong Kong'
  WHERE id = 'f67e89fa-2a35-4ed2-a598-d8378d3899e6';
UPDATE public.fairy_castles SET name = 'Jade Castle', park_name = 'Magic World Shanghai'
  WHERE id = 'ffa6c189-6726-4245-b3b9-0cb8496ec688';
UPDATE public.fairy_castles SET name = 'Sakura Castle', park_name = 'Magic Resort Tokyo'
  WHERE id = 'd60bcb41-1044-4d6b-8931-993aa4c08d42';