ALTER TABLE public.hero_collection_cards DROP CONSTRAINT IF EXISTS hero_collection_cards_user_id_collectible_id_key;
CREATE INDEX IF NOT EXISTS hero_collection_cards_user_collectible_idx ON public.hero_collection_cards (user_id, collectible_id);
GRANT SELECT ON public.hero_collectibles TO anon, authenticated;