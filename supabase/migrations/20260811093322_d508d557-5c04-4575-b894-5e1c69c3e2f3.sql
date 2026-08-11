UPDATE public.card_collectibles SET image_url = NULL
WHERE category_slug = 'legendary-racehorses' AND COALESCE(is_prime, false) = false;