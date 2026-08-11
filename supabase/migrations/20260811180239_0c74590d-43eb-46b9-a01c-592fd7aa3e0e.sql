CREATE TEMP TABLE seed_sport AS
SELECT * FROM (VALUES
 ('football-legends','Football Legends','Original football stars with pace, shooting and passing ratings','⚽','from-green-600 to-emerald-800','dramatic football sports trading-card art, floodlit stadium turf',19,'stats',
   ARRAY['Iron','Golden','Thunder','Silent','Crimson','Northern','Blazing','Marble','Velvet','Steel','Sunset','Granite','Electric','Midnight','Wildfire'],
   ARRAY['Striker','Playmaker','Winger','Sweeper','Keeper','Maestro','Libero','Poacher','Anchor','Captain'],
   ARRAY['pace','shooting','passing','defending','stamina']),
 ('basketball-legends','Basketball Legends','Hardwood icons rated for scoring, handles and vertical leap','🏀','from-orange-500 to-amber-700','bold basketball sports trading-card art, glossy hardwood arena',20,'stats',
   ARRAY['Sky','Neon','Concrete','Hurricane','Velvet','Ice','Downtown','Rocket','Marble','Tempo','Nightshift','Copper','Glide','Fury','Rooftop'],
   ARRAY['Guard','Forward','Center','Dunker','Sniper','Slasher','Rebounder','Ballhandler','Closer','Sixth-Man'],
   ARRAY['scoring','speed','handles','defense','vertical']),
 ('hockey-legends','Ice Hockey Legends','Rink warriors rated for skating, shooting and grit','🏒','from-sky-500 to-blue-800','icy hockey sports trading-card art, frosted rink and glass boards',21,'stats',
   ARRAY['Frost','Blizzard','Glacier','Timber','Steel','Aurora','Hammer','Polar','Ember','Slate','Tundra','Cobalt','Avalanche','Birch','Nordic'],
   ARRAY['Winger','Centre','Defenceman','Goaltender','Enforcer','Sniper','Playmaker','Blueliner','Penalty-Killer','Captain'],
   ARRAY['skating','shooting','checking','goaltending','grit']),
 ('tennis-legends','Tennis Legends','Court masters rated for serve, groundstrokes and nerve','🎾','from-lime-500 to-teal-700','clean tennis sports trading-card art, sunlit court and bright kit',22,'stats',
   ARRAY['Clay','Grass','Hardcourt','Sunlit','Wind','Chalkline','Topspin','Marble','Breeze','Lightning','Duststorm','Ivory','Twilight','Rally','Sandstone'],
   ARRAY['Server','Baseliner','Volleyer','Returner','Tactician','Retriever','Shotmaker','Counterpuncher','Finisher','Champion'],
   ARRAY['serve','forehand','backhand','movement','mental']),
 ('american-football-legends','American Football Legends','Gridiron giants rated for power, speed and awareness','🏈','from-red-600 to-stone-800','gritty american football sports trading-card art, night gridiron and helmet shine',23,'stats',
   ARRAY['Titan','Blitz','Gridiron','Hammer','Thunder','Rampart','Steel','Freight','Bulldozer','Cyclone','Rocket','Boulder','Shockwave','Iron','Redzone'],
   ARRAY['Quarterback','Runningback','Receiver','Linebacker','Cornerback','Tackle','Safety','Kicker','Tight-End','Rusher'],
   ARRAY['power','speed','throwing','tackling','awareness']),
 ('baseball-legends','Baseball Legends','Diamond heroes rated for batting, pitching and fielding','⚾','from-amber-400 to-red-700','nostalgic baseball sports trading-card art, sunny diamond and chalk lines',24,'stats',
   ARRAY['Sandlot','Homerun','Dustbowl','Copper','Bleacher','Curveball','Slider','Prairie','Clutch','Sunfield','Ironglove','Ninth-Inning','Knuckle','Boxcar','Diamondback'],
   ARRAY['Slugger','Pitcher','Catcher','Shortstop','Outfielder','Closer','Baserunner','Infielder','Batter','Ace'],
   ARRAY['batting','pitching','fielding','speed','power']),
 ('golf-legends','Golf Legends','Fairway artists rated for driving, short game and putting','⛳','from-emerald-500 to-lime-700','serene golf sports trading-card art, rolling fairway and morning dew',25,'stats',
   ARRAY['Fairway','Links','Bunker','Dogleg','Highland','Seaside','Birdie','Eagle','Windward','Meadow','Sandtrap','Emerald','Sunrise','Pine','Cliffside'],
   ARRAY['Driver','Striker','Putter','Shaper','Scrambler','Strategist','Wedge-Artist','Longhitter','Reader','Champion'],
   ARRAY['driving','accuracy','short_game','putting','composure']),
 ('cricket-legends','Cricket Legends','Pitch legends rated for batting, bowling and spin','🏏','from-indigo-500 to-emerald-700','vivid cricket sports trading-card art, sunbaked pitch and white kit',26,'stats',
   ARRAY['Monsoon','Sunbaked','Willow','Spinner','Crease','Boundary','Turnpitch','Ochre','Bouncer','Sixhit','Dusk','Kingfisher','Redball','Silkseam','Overcast'],
   ARRAY['Batsman','Bowler','Allrounder','Wicketkeeper','Fielder','Spin-Wizard','Pacer','Opener','Finisher','Captain'],
   ARRAY['batting','bowling','fielding','spin','endurance'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes,stat_keys);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_sport
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, stats)
SELECT
  c.slug,
  c.slug || '-' || lpad((((p.ord - 1) * 10 + s.ord))::text, 3, '0'),
  ((p.ord - 1) * 10 + s.ord),
  p.val || ' ' || s.val,
  lower(s.val),
  CASE
    WHEN ((p.ord - 1) * 10 + s.ord) = 150 THEN 'mythic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 145 THEN 'legendary'
    WHEN ((p.ord - 1) * 10 + s.ord) > 125 THEN 'epic'
    WHEN ((p.ord - 1) * 10 + s.ord) > 90 THEN 'rare'
    ELSE 'common'
  END,
  c.name || ' card #' || ((p.ord - 1) * 10 + s.ord) || ' — ' || p.val || ' ' || s.val ||
  ', a completely original ' || lower(s.val) || ' created for this collection. Compare the ratings against any rival card: the higher value wins the round.',
  c.emoji,
  c.gradient,
  jsonb_build_object(
    c.stat_keys[1], 30 + (((p.ord - 1) * 10 + s.ord) * 37 % 70),
    c.stat_keys[2], 30 + (((p.ord - 1) * 10 + s.ord) * 53 % 70),
    c.stat_keys[3], 30 + (((p.ord - 1) * 10 + s.ord) * 71 % 70),
    c.stat_keys[4], 30 + (((p.ord - 1) * 10 + s.ord) * 89 % 70),
    c.stat_keys[5], 10 + (((p.ord - 1) * 10 + s.ord) * 29 % 90)
  )
FROM seed_sport c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime champion', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_sport
ON CONFLICT (code) DO NOTHING;