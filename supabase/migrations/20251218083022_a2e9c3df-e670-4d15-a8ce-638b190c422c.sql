-- Add collectibles for all rarity levels
INSERT INTO public.collectibles (id, name, description, image_url, rarity_id, is_active)
VALUES
  -- Common (level 1)
  (gen_random_uuid(), 'Bronze Coin', 'A simple bronze coin with mysterious markings.', '/placeholder.svg', '5e59c502-cf7d-484c-86de-a461b24e7938', true),
  (gen_random_uuid(), 'Wooden Token', 'An ancient wooden token carved with symbols.', '/placeholder.svg', '5e59c502-cf7d-484c-86de-a461b24e7938', true),
  (gen_random_uuid(), 'Stone Fragment', 'A piece of stone from an old temple.', '/placeholder.svg', '5e59c502-cf7d-484c-86de-a461b24e7938', true),
  (gen_random_uuid(), 'Copper Ring', 'A basic copper ring with no special properties.', '/placeholder.svg', '5e59c502-cf7d-484c-86de-a461b24e7938', true),
  (gen_random_uuid(), 'Clay Figurine', 'A small clay figurine of unknown origin.', '/placeholder.svg', '5e59c502-cf7d-484c-86de-a461b24e7938', true),
  
  -- Uncommon (level 2)
  (gen_random_uuid(), 'Silver Medallion', 'A silver medallion with intricate patterns.', '/placeholder.svg', 'dfebfc44-ec3c-4e67-83d0-c84b1601fb7f', true),
  (gen_random_uuid(), 'Jade Pendant', 'A beautiful jade pendant with natural swirls.', '/placeholder.svg', 'dfebfc44-ec3c-4e67-83d0-c84b1601fb7f', true),
  (gen_random_uuid(), 'Ancient Scroll', 'A scroll containing forgotten knowledge.', '/placeholder.svg', 'dfebfc44-ec3c-4e67-83d0-c84b1601fb7f', true),
  (gen_random_uuid(), 'Crystal Shard', 'A shard from a larger magical crystal.', '/placeholder.svg', 'dfebfc44-ec3c-4e67-83d0-c84b1601fb7f', true),
  (gen_random_uuid(), 'Mystic Feather', 'A feather from an unknown mystical bird.', '/placeholder.svg', 'dfebfc44-ec3c-4e67-83d0-c84b1601fb7f', true),
  
  -- Rare (level 3)
  (gen_random_uuid(), 'Golden Chalice', 'An ornate golden chalice from royal times.', '/placeholder.svg', 'fb3f55e1-b21a-4e0e-8a0e-9312bf2d23a4', true),
  (gen_random_uuid(), 'Enchanted Mirror', 'A mirror said to show hidden truths.', '/placeholder.svg', 'fb3f55e1-b21a-4e0e-8a0e-9312bf2d23a4', true),
  (gen_random_uuid(), 'Dragon Scale', 'A genuine scale from an ancient dragon.', '/placeholder.svg', 'fb3f55e1-b21a-4e0e-8a0e-9312bf2d23a4', true),
  (gen_random_uuid(), 'Phoenix Feather', 'A radiant feather from a phoenix.', '/placeholder.svg', 'fb3f55e1-b21a-4e0e-8a0e-9312bf2d23a4', true),
  (gen_random_uuid(), 'Moonstone Orb', 'An orb that glows under moonlight.', '/placeholder.svg', 'fb3f55e1-b21a-4e0e-8a0e-9312bf2d23a4', true),
  
  -- Epic (level 4)
  (gen_random_uuid(), 'Crown of Wisdom', 'A legendary crown granting great insight.', '/placeholder.svg', '62ecf051-573d-4388-9d42-a6682d4bb0a2', true),
  (gen_random_uuid(), 'Staff of Elements', 'A powerful staff controlling the elements.', '/placeholder.svg', '62ecf051-573d-4388-9d42-a6682d4bb0a2', true),
  (gen_random_uuid(), 'Celestial Compass', 'A compass pointing to destiny itself.', '/placeholder.svg', '62ecf051-573d-4388-9d42-a6682d4bb0a2', true),
  (gen_random_uuid(), 'Titan Shield', 'An unbreakable shield forged by titans.', '/placeholder.svg', '62ecf051-573d-4388-9d42-a6682d4bb0a2', true),
  (gen_random_uuid(), 'Void Crystal', 'A crystal containing pure void energy.', '/placeholder.svg', '62ecf051-573d-4388-9d42-a6682d4bb0a2', true),
  
  -- Legendary (level 5)
  (gen_random_uuid(), 'Excalibur Replica', 'A perfect replica of the legendary sword.', '/placeholder.svg', '52a60f3a-2d91-4336-9723-053e979ae3ba', true),
  (gen_random_uuid(), 'Philosophers Stone', 'The ultimate alchemical achievement.', '/placeholder.svg', '52a60f3a-2d91-4336-9723-053e979ae3ba', true),
  (gen_random_uuid(), 'Holy Grail', 'The legendary cup of eternal life.', '/placeholder.svg', '52a60f3a-2d91-4336-9723-053e979ae3ba', true),
  (gen_random_uuid(), 'Infinity Amulet', 'An amulet containing infinite power.', '/placeholder.svg', '52a60f3a-2d91-4336-9723-053e979ae3ba', true),
  (gen_random_uuid(), 'Dragon Heart', 'The crystallized heart of an elder dragon.', '/placeholder.svg', '52a60f3a-2d91-4336-9723-053e979ae3ba', true);