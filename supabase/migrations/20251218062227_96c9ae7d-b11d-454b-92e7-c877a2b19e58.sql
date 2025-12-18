-- Add more Mystery Box tiers (varied prices)
INSERT INTO public.mystery_boxes (id, name, description, price, icon, min_rarity_level, max_rarity_level, is_active)
VALUES
  (gen_random_uuid(), 'Starter Mystery Box', 'Entry-level box with fun random items. Best for testing your luck.', 50, '🟫', 1, 2, true),
  (gen_random_uuid(), 'Silver Mystery Box', 'Better odds than Starter. Increased chance for rare items.', 150, '🥈', 1, 3, true),
  (gen_random_uuid(), 'Gold Mystery Box', 'Strong mid-tier box with improved rare and epic rates.', 350, '🥇', 2, 4, true),
  (gen_random_uuid(), 'Ruby Mystery Box', 'Premium box with boosted epic rates and occasional legendary drops.', 1200, '💠', 3, 5, true),
  (gen_random_uuid(), 'Galaxy Mystery Box', 'Cosmic tier with very high legendary chance and exclusive content.', 3000, '🌌', 4, 5, true),
  (gen_random_uuid(), 'Infinity Mystery Box', 'Top-end box with near-maximum legendary rates and ultra-exclusive rewards.', 6500, '♾️', 5, 5, true)
ON CONFLICT (id) DO NOTHING;