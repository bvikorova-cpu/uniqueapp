
ALTER TABLE public.bazaar_items
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: ak je existujúce image_url nastavené a image_urls prázdne, skopíruj
UPDATE public.bazaar_items
   SET image_urls = ARRAY[image_url]
 WHERE image_url IS NOT NULL
   AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
