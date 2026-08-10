ALTER TABLE public.characters REPLICA IDENTITY FULL;
ALTER TABLE public.character_battles REPLICA IDENTITY FULL;
ALTER TABLE public.hero_collection_cards REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.characters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.character_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_collection_cards;