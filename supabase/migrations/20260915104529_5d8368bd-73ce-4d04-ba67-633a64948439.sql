INSERT INTO public.gift_catalog (slug, name, category, price_credits, rarity, animation, is_active, sort_order) VALUES
  ('mega-crystal-palace', 'Crystal Palace', 'mega', 35999, 'legendary', 'mega', true, 109),
  ('mega-golden-tiger', 'Golden Tiger', 'mega', 27999, 'legendary', 'mega', true, 110),
  ('mega-sky-whale', 'Sky Whale', 'mega', 22999, 'legendary', 'mega', true, 111),
  ('mega-fireworks', 'Fireworks Spectacle', 'mega', 12000, 'legendary', 'mega', true, 112),
  ('mega-royal-carriage', 'Royal Carriage', 'mega', 18999, 'legendary', 'mega', true, 113),
  ('mega-space-station', 'Space Station', 'mega', 44999, 'legendary', 'mega', true, 114),
  ('mega-emerald-peacock', 'Emerald Peacock', 'mega', 31999, 'legendary', 'mega', true, 115),
  ('mega-party-bus', 'Neon Party Bus', 'mega', 15999, 'legendary', 'mega', true, 116)
ON CONFLICT (slug) DO NOTHING;