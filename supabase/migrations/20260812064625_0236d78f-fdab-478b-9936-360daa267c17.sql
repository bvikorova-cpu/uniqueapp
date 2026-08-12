CREATE TEMP TABLE seed_race AS
SELECT * FROM (VALUES
 ('grand-prix-machines','Grand Prix Machines','Fictional open-wheel grand prix cars rated for speed, downforce and reliability','🏎️','from-red-600 to-orange-600','high-octane motorsport poster art, floodlit circuit, motion blur and sparks',46,'stats','grand prix race car',
   ARRAY['Velocity','Apex','Nitro','Phantom','Crimson','Titan','Aero','Quantum','Vortex','Halo','Turbo','Meteor','Zenith','Onyx','Pulse'],
   ARRAY['GP-01','Chicane','Slipstream','Downforce','Podium','Grid','Redline','Sector','Pitlane','Chequer']),
 ('rally-warriors','Rally Warriors','Gravel-spitting rally machines built for forests, snow and dust','🌲','from-amber-600 to-emerald-700','gritty rally photography illustration, gravel dust and pine forest stages',47,'stats','rally car',
   ARRAY['Gravel','Boulder','Frostbite','Timber','Dust','Ridge','Avalanche','Canyon','Tundra','Thorn','Cinder','Torrent','Summit','Mudlark','Blizzard'],
   ARRAY['Rally','Special','Stage','Drifter','Sprinter','Charger','Runner','Raider','Bandit','Comet']),
 ('endurance-hypercars','Endurance Hypercars','Night-running prototypes bred for 24-hour races','🌙','from-slate-700 to-cyan-600','sleek night endurance racing art, rain spray and glowing headlights',48,'stats','endurance prototype race car',
   ARRAY['Nocturne','Halcyon','Eclipse','Aurora','Requiem','Solaris','Vigil','Tempest','Lumen','Sable','Cobalt','Zephyr','Obsidian','Nova','Marathon'],
   ARRAY['Prototype','Endurance','Nightrunner','Longtail','Hyper','Circuit','Marque','Legend','Relay','Twilight']),
 ('drift-street-kings','Drift Street Kings','Neon-lit drift builds trading grip for pure style','💨','from-fuchsia-600 to-indigo-700','neon street-racing illustration, tire smoke and wet city asphalt',49,'stats','drift car',
   ARRAY['Neon','Smoke','Midnight','Kanji','Chrome','Rogue','Sideways','Static','Voltage','Graffiti','Tokyo','Bassline','Wildcard','Flicker','Riot'],
   ARRAY['Drifter','King','Slide','Tandem','Smokeshow','Streetline','Runner','Outlaw','Nightcall','Skidmark']),
 ('superbike-legends','Superbike Legends','Knee-down superbikes carving the perfect racing line','🏍️','from-orange-500 to-rose-700','dynamic superbike racing art, low knee-down cornering, sunlit tarmac',50,'stats','racing superbike',
   ARRAY['Ronin','Falcon','Hornet','Sabre','Jetstream','Kestrel','Bolt','Viper','Comet','Talon','Raptor','Fury','Tempo','Blaze','Marauder'],
   ARRAY['Superbike','Racer','Kneedown','Sprint','Slipstream','Highside','Torque','Circuit','Rider','Redline'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,subject,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_race
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, stats)
SELECT
  c.slug,
  c.slug || '-' || lpad((((p.ord - 1) * 10 + s.ord))::text, 3, '0'),
  ((p.ord - 1) * 10 + s.ord),
  p.val || ' ' || s.val,
  c.subject,
  CASE
    WHEN ((p.ord - 1) * 10 + s.ord) = 150 THEN 'mythic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 145 THEN 'legendary'
    WHEN ((p.ord - 1) * 10 + s.ord) > 125 THEN 'epic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 90 THEN 'rare'
    ELSE 'common'
  END,
  'Race card #' || ((p.ord - 1) * 10 + s.ord) || ' — ' || p.val || ' ' || s.val ||
  '. Compare its ratings against any rival machine: the higher value wins the duel.',
  c.emoji,
  c.gradient,
  jsonb_build_object(
    'top_speed',    30 + (((p.ord - 1) * 10 + s.ord) * 37 % 70),
    'acceleration', 30 + (((p.ord - 1) * 10 + s.ord) * 53 % 70),
    'handling',     30 + (((p.ord - 1) * 10 + s.ord) * 71 % 70),
    'braking',      30 + (((p.ord - 1) * 10 + s.ord) * 89 % 70),
    'reliability',  10 + (((p.ord - 1) * 10 + s.ord) * 29 % 90)
  )
FROM seed_race c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999,
  CASE slug
    WHEN 'grand-prix-machines' THEN 'World Champion Prime'
    WHEN 'rally-warriors' THEN 'Rally Crown Prime'
    WHEN 'endurance-hypercars' THEN 'Twenty-Four Hour Prime'
    WHEN 'drift-street-kings' THEN 'Drift King Prime'
    ELSE 'Superbike Crown Prime'
  END,
  'prime champion machine', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every card in the set.',
  '👑', gradient, true
FROM seed_race
ON CONFLICT (code) DO NOTHING;