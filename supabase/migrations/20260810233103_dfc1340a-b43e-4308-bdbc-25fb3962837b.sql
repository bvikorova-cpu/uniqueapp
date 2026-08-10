ALTER TABLE public.card_categories
  ADD COLUMN IF NOT EXISTS card_kind text NOT NULL DEFAULT 'character',
  ADD COLUMN IF NOT EXISTS available_from timestamptz,
  ADD COLUMN IF NOT EXISTS available_until timestamptz;

ALTER TABLE public.card_collectibles
  ADD COLUMN IF NOT EXISTS stats jsonb;

CREATE TEMP TABLE seed_cats2 AS
SELECT * FROM (VALUES
 ('duel-stats','Duel Stats','Top-Trumps style battle cards with Strength, Speed and Magic ratings','⚔️','from-red-500 to-orange-600','bold comic-style battle card art with dynamic action pose',11,'stats',
   ARRAY['Iron','Blazing','Frozen','Thunder','Venom','Golden','Savage','Arcane','Steel','Crimson','Phantom','Titan','Rapid','Granite','Storm'],
   ARRAY['Duelist','Berserker','Sorcerer','Ranger','Knight','Assassin','Brawler','Mystic','Sentinel','Champion']),
 ('personality-types','Personality Archetypes','Playful archetype cards you collect and pin on your profile','🧠','from-sky-500 to-indigo-600','flat modern character illustration with bold colours',12,'archetype',
   ARRAY['Night','Coffee','Chaos','Sunday','Deadline','Overthinking','Playlist','Snack','Plant','List','Rainy-Day','Group-Chat','Early','Daydream','Comfort'],
   ARRAY['Owl','Maniac','Gremlin','Dreamer','Warrior','Perfectionist','Curator','Hunter','Whisperer','Architect']),
 ('meme-culture','Meme & Internet Culture','Funny cards inspired by internet trends, refreshed as new ones blow up','😂','from-yellow-400 to-pink-500','vibrant playful cartoon meme art, exaggerated expressions',13,'meme',
   ARRAY['Doom','Main','Side','Touch','Ratio','Rizz','Lore','Vibe','Cringe','Slay','Buffer','Airplane','Screenshot','Notification','Unhinged'],
   ARRAY['Scroller','Character','Quest','Grass','Enjoyer','Enthusiast','Drop','Check','Arc','Energy']),
 ('daily-quests','Daily Quests','Tiny daily missions that nudge you to do one good thing','🎯','from-emerald-500 to-lime-600','clean motivational flat illustration with a single clear icon',14,'quest',
   ARRAY['Ten-Minute','Morning','Sunset','Silent','Kind','Tidy','Hydration','Screen-Free','Deep-Breath','Gratitude','Stretch','Playlist','Sunlight','Handwritten','Digital-Detox'],
   ARRAY['Walk','Reset','Message','Cleanup','Journal','Break','Challenge','Ritual','Stretch','Moment']),
 ('lifehacks','Lifehacks & Tips','Short practical tips for productivity, cooking, money and AI','💡','from-amber-400 to-teal-500','clean infographic-style illustration, minimal and bright',15,'tip',
   ARRAY['Productivity','Kitchen','Money','AI','Travel','Study','Sleep','Focus','Cleaning','Wardrobe','Phone','Fitness','Shopping','Email','Weekend'],
   ARRAY['Hack','Shortcut','Rule','Trick','Routine','Checklist','Upgrade','Habit','Fix','Formula']),
 ('world-facts','Curious Facts & Words','Surprising facts and beautiful foreign words with their meaning','🌍','from-cyan-500 to-emerald-600','elegant editorial illustration, museum poster aesthetic',16,'fact',
   ARRAY['Cosmic','Ocean','Ancient','Human','Animal','Language','Weather','Number','Invention','Plant','Mineral','Sound','Colour','Time','Untranslatable'],
   ARRAY['Fact','Wonder','Mystery','Record','Origin','Curiosity','Detail','Discovery','Word','Secret']),
 ('seasonal-vault','Seasonal Vault','Limited-time series: Halloween, Christmas, Summer Camp and more','🎃','from-orange-500 to-purple-700','festive seasonal illustration with warm atmospheric lighting',17,'seasonal',
   ARRAY['Pumpkin','Frostbite','Midsummer','Candlelit','Snowfall','Bonfire','Harvest','Firework','Cocoa','Blossom','Lantern','Campfire','Gingerbread','Thunderstorm','Starlit'],
   ARRAY['Spirit','Guest','Keeper','Night','Parade','Market','Tale','Charm','Trail','Feast'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,available_from,available_until)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind,
       CASE WHEN slug = 'seasonal-vault' THEN now() ELSE NULL END,
       CASE WHEN slug = 'seasonal-vault' THEN now() + interval '90 days' ELSE NULL END
FROM seed_cats2
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, stats)
SELECT
  c.slug,
  c.slug || '-' || lpad((((p.ord - 1) * 10 + s.ord))::text, 3, '0'),
  ((p.ord - 1) * 10 + s.ord),
  p.val || ' ' || s.val,
  s.val,
  CASE
    WHEN ((p.ord - 1) * 10 + s.ord) = 150 THEN 'mythic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 145 THEN 'legendary'
    WHEN ((p.ord - 1) * 10 + s.ord) > 125 THEN 'epic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 90 THEN 'rare'
    ELSE 'common'
  END,
  CASE c.card_kind
    WHEN 'stats' THEN 'A ' || lower(p.val || ' ' || s.val) || ' built for the arena. Compare its attributes against any rival card — the higher value wins the round.'
    WHEN 'archetype' THEN 'The ' || p.val || ' ' || s.val || ' archetype: card #' || ((p.ord - 1) * 10 + s.ord) || ' of ' || c.name || '. Pin it on your profile when it describes your mood.'
    WHEN 'meme' THEN 'Internet culture card #' || ((p.ord - 1) * 10 + s.ord) || ' — ' || p.val || ' ' || s.val || '. Certified online, expires whenever the trend does.'
    WHEN 'quest' THEN 'Today''s quest: complete a ' || lower(p.val || ' ' || s.val) || '. Small effort, real reward — keep the card as proof you did it.'
    WHEN 'tip' THEN 'A practical ' || lower(p.val || ' ' || s.val) || ' you can use today. Quick to apply, easy to keep.'
    WHEN 'fact' THEN 'A curious ' || lower(p.val || ' ' || s.val) || ' from around the world — collect knowledge one card at a time.'
    ELSE 'Limited seasonal card: ' || p.val || ' ' || s.val || '. Only obtainable while the current event window is open.'
  END,
  c.emoji,
  c.gradient,
  CASE WHEN c.card_kind = 'stats' THEN jsonb_build_object(
    'strength', 30 + (((p.ord - 1) * 10 + s.ord) * 37 % 70),
    'speed',    30 + (((p.ord - 1) * 10 + s.ord) * 53 % 70),
    'magic',    30 + (((p.ord - 1) * 10 + s.ord) * 71 % 70),
    'defense',  30 + (((p.ord - 1) * 10 + s.ord) * 89 % 70),
    'luck',     10 + (((p.ord - 1) * 10 + s.ord) * 29 % 90)
  ) ELSE NULL END
FROM seed_cats2 c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime guardian', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_cats2
ON CONFLICT (code) DO NOTHING;