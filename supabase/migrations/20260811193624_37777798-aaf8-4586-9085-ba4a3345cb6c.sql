CREATE TEMP TABLE seed_kids AS
SELECT * FROM (VALUES
 ('kids-dino-pals','Dino Pals','Friendly baby dinosaurs with big smiles and tiny roars','🦕','from-lime-400 to-emerald-600','adorable kawaii cartoon illustration for young children, thick soft outlines, bright happy colours, big friendly eyes, flat storybook style',30,'character',
   ARRAY['Bubbly','Stompy','Sunny','Wiggly','Snuggly','Puffy','Zippy','Chomps','Twinkle','Rumble','Squeaky','Pebble','Giggly','Munchy','Sparky'],
   ARRAY['Rex','Tops','Spike','Horn','Wing','Tail','Claw','Egg','Stomp','Roar']),
 ('kids-rescue-heroes','Rescue Heroes','Cheerful fire trucks, diggers and rescue helpers on duty','🚒','from-red-400 to-orange-600','adorable kawaii cartoon vehicle illustration for young children, thick soft outlines, smiling faces on vehicles, bright primary colours',31,'character',
   ARRAY['Beep','Turbo','Rusty','Sunny','Splash','Rumble','Zoom','Bolt','Dusty','Scoop','Wheelie','Hoot','Buzzy','Sparky','Tootle'],
   ARRAY['Truck','Digger','Chopper','Boat','Train','Tractor','Van','Crane','Rover','Racer']),
 ('kids-pony-sparkles','Pony Sparkles','Rainbow ponies and glitter unicorns with kind hearts','🦄','from-pink-400 to-violet-500','adorable kawaii cartoon pony illustration for young children, pastel rainbow colours, sparkles, soft rounded shapes, big shiny eyes',32,'character',
   ARRAY['Glitter','Rainbow','Sugar','Cloudy','Berry','Twirl','Starry','Cotton','Petal','Bubble','Moonly','Honey','Frosty','Cherry','Dreamy'],
   ARRAY['Pony','Unicorn','Hoof','Mane','Sparkle','Wish','Cloud','Charm','Dancer','Bloom']),
 ('kids-jungle-babies','Jungle Babies','Baby elephants, lions and monkeys on gentle jungle days','🐘','from-emerald-400 to-teal-600','adorable kawaii cartoon baby-animal illustration for young children, soft outlines, warm jungle colours, cuddly proportions',33,'character',
   ARRAY['Tumble','Nibbles','Toots','Fuzzy','Peanut','Wobble','Cocoa','Jumpy','Mango','Snoozy','Tickle','Bongo','Coco','Waddle','Pumpkin'],
   ARRAY['Cub','Calf','Monkey','Panda','Sloth','Zebra','Giraffe','Hippo','Parrot','Tiger']),
 ('kids-space-kiddos','Space Kiddos','Little astronauts, rockets and squishy friendly aliens','🚀','from-indigo-400 to-sky-500','adorable kawaii cartoon space illustration for young children, rounded rockets, smiling stars, bright playful colours',34,'character',
   ARRAY['Blip','Zoomy','Astro','Comet','Fizzy','Bloop','Rocket','Twinkle','Nova','Wobbly','Orbit','Squishy','Pixel','Moony','Glow'],
   ARRAY['Astronaut','Rocket','Alien','Star','Moon','Planet','Rover','Comet','Robot','Satellite']),
 ('kids-sweet-treats','Sweet Treats','Smiling cupcakes, ice creams and happy little cookies','🧁','from-rose-300 to-amber-400','adorable kawaii cartoon food illustration for young children, smiling cakes and sweets with faces, pastel candy colours',35,'character',
   ARRAY['Sprinkle','Frosty','Choco','Jelly','Sugar','Marsh','Berry','Caramel','Minty','Fudgy','Vanilla','Cherry','Bubble','Honey','Cocoa'],
   ARRAY['Cupcake','Cookie','Donut','Lolly','Icecream','Pudding','Muffin','Candy','Waffle','Pancake']),
 ('kids-sea-buddies','Sea Buddies','Bubbly fish, turtles and octopus pals under the waves','🐠','from-cyan-400 to-blue-600','adorable kawaii cartoon sea-creature illustration for young children, bubbly underwater scene, bright aqua colours, big happy eyes',36,'character',
   ARRAY['Bubbles','Splashy','Finny','Wavy','Coral','Squirt','Pearly','Glub','Sandy','Puffy','Shelly','Ripple','Salty','Drifty','Foamy'],
   ARRAY['Fish','Turtle','Octopus','Seal','Whale','Crab','Starfish','Seahorse','Dolphin','Jellyfish']),
 ('kids-super-kiddos','Super Kiddos','Tiny caped heroes who help friends and share snacks','🦸','from-sky-400 to-fuchsia-500','adorable kawaii cartoon superhero-kid illustration for young children, chunky capes and masks, bold cheerful colours, soft outlines',37,'character',
   ARRAY['Captain','Super','Mighty','Brave','Kind','Speedy','Tiny','Cheery','Helpful','Shiny','Bouncy','Sunny','Zappy','Cuddle','Hero'],
   ARRAY['Cape','Mask','Star','Shield','Boots','Dash','Smile','Hug','Beam','Buddy']),
 ('kids-farm-friends','Farm Friends','Happy cows, ducklings and piglets on a sunny little farm','🐮','from-yellow-300 to-lime-500','adorable kawaii cartoon farm-animal illustration for young children, sunny meadow, soft rounded shapes, cheerful colours',38,'character',
   ARRAY['Moo','Cluck','Oink','Quacky','Woolly','Hoppy','Nibble','Daisy','Muddy','Clover','Buttercup','Pippin','Hayseed','Truffle','Doodle'],
   ARRAY['Cow','Chick','Piglet','Duckling','Lamb','Bunny','Pony','Goat','Goose','Puppy']),
 ('kids-garden-bugs','Garden Bugs','Friendly ladybirds, bees and snails in a flowery garden','🐝','from-amber-300 to-green-500','adorable kawaii cartoon bug illustration for young children, flowery garden background, bright cheerful colours, smiling insects',39,'character',
   ARRAY['Buzzy','Dotty','Snaily','Flutter','Wiggly','Hoppy','Crawly','Fuzzy','Zippy','Twiggy','Blossom','Chirpy','Nectar','Dewy','Pollen'],
   ARRAY['Bee','Ladybird','Snail','Butterfly','Ant','Beetle','Caterpillar','Dragonfly','Cricket','Firefly'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,card_kind,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order,card_kind)
SELECT slug,name,description,emoji,gradient,art_style,sort_order,card_kind FROM seed_kids
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
  ', a friendly original character drawn just for little collectors.',
  c.emoji,
  c.gradient
FROM seed_kids c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord)
WHERE ((p.ord - 1) * 10 + s.ord) <= 150
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime champion', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_kids
ON CONFLICT (code) DO NOTHING;