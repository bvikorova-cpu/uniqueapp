
-- 1) Thumbnails for the 6 new castles (use existing Wikipedia/Unsplash public images)
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800&q=80'
  WHERE name = 'Neuschwanstein Castle';
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1568797629192-789acf8e4df3?w=800&q=80'
  WHERE name = 'Edinburgh Castle';
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1571406761758-9a3eed5338ef?w=800&q=80'
  WHERE name = 'Bojnice Castle';
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'
  WHERE name = 'Himeji Castle';
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80'
  WHERE name = 'Hohenzollern Castle';
UPDATE public.fairy_castles SET thumbnail_url = 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80'
  WHERE name = 'Prague Castle';

-- 2) Panorama placeholders for rooms in the 6 new castles
WITH new_castle_ids AS (
  SELECT id FROM public.fairy_castles
  WHERE name IN ('Neuschwanstein Castle','Edinburgh Castle','Bojnice Castle','Himeji Castle','Hohenzollern Castle','Prague Castle')
)
UPDATE public.fairy_castle_rooms r
SET panorama_url = CASE r.room_name
  WHEN 'Grand Entrance Hall' THEN 'https://images.unsplash.com/photo-1602940659805-770d1b3b9911?w=2048&q=80'
  WHEN 'Throne Room'         THEN 'https://images.unsplash.com/photo-1601661884888-c39c63c69cea?w=2048&q=80'
  WHEN 'Secret Library'      THEN 'https://images.unsplash.com/photo-1568667256549-094345857637?w=2048&q=80'
  WHEN 'Tower Lookout'       THEN 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=2048&q=80'
  ELSE r.panorama_url
END
WHERE r.castle_id IN (SELECT id FROM new_castle_ids)
  AND r.panorama_url IS NULL;

-- 3) Demo stamps for Nathalie (a8f98c5c-3ce8-4928-bfaf-061a700411c6)
INSERT INTO public.user_castle_stamps (user_id, castle_id)
SELECT 'a8f98c5c-3ce8-4928-bfaf-061a700411c6'::uuid, id
FROM public.fairy_castles
WHERE name IN ('Crystal Castle','Rose Castle','Royal Château')
ON CONFLICT DO NOTHING;
