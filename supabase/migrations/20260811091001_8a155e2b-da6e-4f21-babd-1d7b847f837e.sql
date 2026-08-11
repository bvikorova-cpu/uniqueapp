CREATE TEMP TABLE seed_horse AS
SELECT * FROM (VALUES
 ('legendary-racehorses','Legendary Racehorses','Champion thoroughbreds with speed, stamina and heart ratings','🏇','from-amber-500 to-red-700','dramatic equestrian sports painting, golden hour turf track',18,'stats',
   ARRAY['Midnight','Golden','Thunder','Desert','Silver','Crimson','Storm','Emerald','Iron','Royal','Shadow','Blazing','Frozen','Wild','Northern'],
   ARRAY['Comet','Stallion','Gallop','Mirage','Sovereign','Arrow','Mare','Blaze','Hooves','Stride','Dancer','Charger','Legend','Spirit','Runner'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_horse
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, stats)
SELECT
  c.slug,
  c.slug || '-' || lpad((((p.ord - 1) * 10 + s.ord))::text, 3, '0'),
  ((p.ord - 1) * 10 + s.ord),
  p.val || ' ' || s.val,
  'racehorse',
  CASE
    WHEN ((p.ord - 1) * 10 + s.ord) = 150 THEN 'mythic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 145 THEN 'legendary'
    WHEN ((p.ord - 1) * 10 + s.ord) > 125 THEN 'epic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 90 THEN 'rare'
    ELSE 'common'
  END,
  'Racing card #' || ((p.ord - 1) * 10 + s.ord) || ' — ' || p.val || ' ' || s.val ||
  ', a champion of the turf. Compare its ratings against any rival card: the higher value takes the race.',
  c.emoji,
  c.gradient,
  jsonb_build_object(
    'speed',    30 + (((p.ord - 1) * 10 + s.ord) * 37 % 70),
    'stamina',  30 + (((p.ord - 1) * 10 + s.ord) * 53 % 70),
    'strength', 30 + (((p.ord - 1) * 10 + s.ord) * 71 % 70),
    'defense',  30 + (((p.ord - 1) * 10 + s.ord) * 89 % 70),
    'luck',     10 + (((p.ord - 1) * 10 + s.ord) * 29 % 90)
  )
FROM seed_horse c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, 'Triple Crown Prime', 'prime champion', 'prime',
  'The golden Prime card of the Legendary Racehorses collection — awarded only to collectors who own every card in the set.',
  '👑', gradient, true
FROM seed_horse
ON CONFLICT (code) DO NOTHING;