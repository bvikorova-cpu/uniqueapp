CREATE TEMP TABLE seed_kids3d AS
SELECT * FROM (VALUES
 ('kids3d-magic-pets','Magic Pet Friends','Sparkly magic pets with fluffy fur and glowing wings','🐾','from-pink-400 to-cyan-400','glossy cinematic 3D animated movie render for children, Pixar-like cute character, big shiny eyes, soft fluffy fur, glowing pastel magic, lush fantasy meadow',40,'character',
   ARRAY['Sparkle','Glimmer','Fluffy','Rainbow','Sunny','Twinkle','Bubbly','Snuggle','Petal','Cuddle','Honey','Star','Cloudy','Berry','Dazzle'],
   ARRAY['Kitten','Puppy','Bunny','Foxling','Deerling','Hamster','Panda','Otterling','Squirrel','Hedgeling']),
 ('kids3d-unicorn-kingdom','Unicorn Kingdom','Rainbow unicorns and winged ponies of a shining kingdom','🦄','from-fuchsia-400 to-violet-500','glossy cinematic 3D animated movie render for children, rainbow mane with silky strands, iridescent horn, sparkling dust, magical bright kingdom backdrop',41,'character',
   ARRAY['Rainbow','Moonlight','Sugar','Crystal','Aurora','Blossom','Glitter','Cotton','Starlight','Dreamy','Opal','Cherry','Frost','Sunbeam','Lulla'],
   ARRAY['Unicorn','Pegasus','Pony','Filly','Charger','Prancer','Dancer','Mare','Foal','Guardian']),
 ('kids3d-fairy-blossoms','Fairy Blossoms','Tiny flower fairies with shimmering butterfly wings','🧚','from-rose-300 to-emerald-400','glossy cinematic 3D animated movie render for children, tiny fairy with translucent shimmering wings, flower petal dress, dew drops, glowing garden bokeh',42,'character',
   ARRAY['Petal','Dewy','Blossom','Lily','Honey','Poppy','Willow','Misty','Clover','Rosy','Fern','Daisy','Peachy','Bluebell','Sunny'],
   ARRAY['Fairy','Sprite','Pixie','Bloomling','Wingling','Dancer','Whisper','Dreamer','Glowfly','Keeper']),
 ('kids3d-baby-dragons','Baby Dragons','Cute baby dragons with shiny scales and tiny wings','🐉','from-amber-400 to-teal-500','glossy cinematic 3D animated movie render for children, chubby baby dragon, glossy colourful scales, tiny wings, friendly smile, no fire on anyone, bright fantasy cliffs',43,'character',
   ARRAY['Ember','Blaze','Puff','Scaly','Zippy','Cobalt','Cinder','Bubbly','Gizmo','Thunder','Pebble','Mossy','Frosty','Sunny','Wobble'],
   ARRAY['Dragonling','Wyrmling','Hatchling','Flapper','Roarer','Glider','Scale','Sparkwing','Cavepup','Skypup']),
 ('kids3d-robot-mates','Robot Mates','Friendly little robots with glowing lights and rolling wheels','🤖','from-sky-400 to-indigo-500','glossy cinematic 3D animated movie render for children, rounded toy robot, smooth painted metal, glowing friendly LED eyes, chunky proportions, bright playful workshop',44,'character',
   ARRAY['Bolt','Beep','Chip','Rusty','Gizmo','Blinky','Turbo','Pixel','Sprocket','Buzzy','Cogsy','Nano','Zappy','Wobbly','Dash'],
   ARRAY['Bot','Droid','Rover','Helper','Buddy','Mech','Scout','Tinker','Builder','Racer']),
 ('kids3d-dino-explorers','Dino Explorers','Brave baby dinosaurs exploring jungle valleys','🦖','from-lime-400 to-emerald-600','glossy cinematic 3D animated movie render for children, cute baby dinosaur with soft skin texture, big curious eyes, adventure backpack details, sunlit jungle valley',45,'character',
   ARRAY['Stompy','Chomper','Spike','Rumble','Pebble','Zoomy','Sunny','Munchy','Wiggly','Bronto','Rocky','Snappy','Puffy','Dusty','Bouncy'],
   ARRAY['Rex','Tops','Raptor','Longneck','Trike','Stego','Ankylo','Ptero','Diplo','Explorer'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_kids3d
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
  ', an original 3D-animated friend created just for little collectors.',
  c.emoji,
  c.gradient
FROM seed_kids3d c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime champion', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_kids3d
ON CONFLICT (code) DO NOTHING;