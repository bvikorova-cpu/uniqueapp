CREATE TEMP TABLE seed_bf AS
SELECT * FROM (VALUES
 ('beauty-icons','Beauty Icons','Original glamour muses with editorial hair, makeup and jewellery artistry','💄','from-pink-500 to-rose-700','luxurious editorial beauty trading-card art, glossy magazine lighting',26,'character',
   ARRAY['Velvet','Rosegold','Porcelain','Amber','Midnight','Silk','Blush','Ivory','Crimson','Opal','Champagne','Onyx','Pearl','Lilac','Bronze'],
   ARRAY['Muse','Enchantress','Icon','Visionary','Siren','Dreamer','Sculptor','Alchemist','Radiance','Legend']),
 ('fashion-couture','Fashion Couture','Runway visionaries in invented haute-couture silhouettes','👗','from-fuchsia-500 to-violet-800','high-fashion runway trading-card art, couture silhouettes and studio light',27,'character',
   ARRAY['Atelier','Neon','Monochrome','Baroque','Origami','Feather','Chrome','Tulle','Sculpted','Avant','Ribbon','Lacquer','Denim','Cashmere','Mirror'],
   ARRAY['Couturier','Model','Stylist','Silhouette','Tailor','Trendsetter','Draper','Maverick','Muse','Maestro']),
 ('royal-princesses','Royal Princesses','Invented princesses of imaginary kingdoms and their royal courts','👑','from-rose-400 to-purple-700','regal storybook princess trading-card art, jewelled gowns and palace light',28,'character',
   ARRAY['Moonlit','Snowbloom','Rosewater','Starlace','Emberveil','Frostcrown','Sunpetal','Seafoam','Duskrose','Goldleaf','Ivyheart','Stormsilk','Dawnglass','Nightbloom','Willowmist'],
   ARRAY['Princess','Heiress','Infanta','Duchess','Regent','Crown-Maiden','Dauphine','Court-Dancer','Sovereign','Blossom']),
 ('storybook-folk','Storybook Folk','Original fairytale characters — sprites, cobblers, witches and talking beasts','📖','from-amber-400 to-emerald-700','warm storybook illustration trading-card art, whimsical fairytale scenes',29,'character',
   ARRAY['Gingerbread','Thimble','Lantern','Acorn','Cobblestone','Puddle','Whisker','Turnip','Bramble','Candlewick','Mossy','Buttonpaw','Toadstool','Windmill','Rooftop'],
   ARRAY['Cobbler','Sprite','Witch','Woodcutter','Tinker','Talking-Fox','Baker','Wanderer','Riddler','Fiddler'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_bf
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient)
SELECT
  c.slug,
  c.slug || '-' || lpad((((p.ord - 1) * 10 + s.ord))::text, 3, '0'),
  ((p.ord - 1) * 10 + s.ord),
  p.val || ' ' || s.val,
  lower(replace(s.val,'-',' ')),
  CASE
    WHEN ((p.ord - 1) * 10 + s.ord) = 150 THEN 'mythic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 145 THEN 'legendary'
    WHEN ((p.ord - 1) * 10 + s.ord) > 125 THEN 'epic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 90 THEN 'rare'
    ELSE 'common'
  END,
  c.name || ' card #' || ((p.ord - 1) * 10 + s.ord) || ' — ' || p.val || ' ' || s.val ||
  ', a completely original character created just for this collection.',
  c.emoji,
  c.gradient
FROM seed_bf c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime champion', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_bf
ON CONFLICT (code) DO NOTHING;