
CREATE TABLE public.card_categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '🃏',
  gradient text NOT NULL DEFAULT 'from-slate-500 to-slate-700',
  art_style text NOT NULL DEFAULT 'painterly digital art',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.card_collectibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL REFERENCES public.card_categories(slug) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  card_index integer NOT NULL,
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  rarity text NOT NULL DEFAULT 'common',
  lore text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '🃏',
  gradient text NOT NULL DEFAULT 'from-slate-500 to-slate-700',
  image_url text,
  is_prime boolean NOT NULL DEFAULT false,
  times_collected integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_card_collectibles_category ON public.card_collectibles(category_slug, card_index);

CREATE TABLE public.user_card_collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collectible_id uuid NOT NULL REFERENCES public.card_collectibles(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  copies integer NOT NULL DEFAULT 1,
  credits_spent integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, collectible_id)
);
CREATE INDEX idx_user_card_collection_user ON public.user_card_collection(user_id, category_slug);

GRANT SELECT ON public.card_categories TO anon;
GRANT SELECT ON public.card_categories TO authenticated;
GRANT ALL ON public.card_categories TO service_role;

GRANT SELECT ON public.card_collectibles TO anon;
GRANT SELECT ON public.card_collectibles TO authenticated;
GRANT ALL ON public.card_collectibles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_card_collection TO authenticated;
GRANT ALL ON public.user_card_collection TO service_role;

ALTER TABLE public.card_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card categories are public" ON public.card_categories FOR SELECT USING (true);
CREATE POLICY "Card catalogue is public" ON public.card_collectibles FOR SELECT USING (true);
CREATE POLICY "Users view own card collection" ON public.user_card_collection FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add to own card collection" ON public.user_card_collection FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own card collection" ON public.user_card_collection FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_card_collectibles_updated BEFORE UPDATE ON public.card_collectibles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_card_collection_updated BEFORE UPDATE ON public.user_card_collection
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TEMP TABLE seed_cats AS
SELECT * FROM (VALUES
 ('mythic-beasts','Mythic Beasts','Dragons, phoenixes and legendary creatures of old myth','🐉','from-rose-500 to-amber-600','epic painterly fantasy creature art',1,
   ARRAY['Ember','Frost','Storm','Void','Solar','Jade','Obsidian','Crimson','Azure','Thunder','Moonlit','Ashen','Iron','Verdant','Radiant'],
   ARRAY['Dragon','Phoenix','Griffin','Wyvern','Kraken','Chimera','Basilisk','Hydra','Sphinx','Leviathan']),
 ('celestial-spirits','Celestial Spirits','Constellations, planets and cosmic entities given form','✨','from-indigo-500 to-fuchsia-600','luminous cosmic celestial art',2,
   ARRAY['Nova','Aurora','Eclipse','Nebula','Zenith','Lyra','Vega','Orion','Halcyon','Seraph','Astral','Lunar','Solstice','Comet','Quasar'],
   ARRAY['Herald','Oracle','Warden','Weaver','Sentinel','Voyager','Seraphim','Wanderer','Archon','Muse']),
 ('ancient-legends','Ancient Legends','Heroes, oracles and warriors of forgotten civilisations','🏺','from-amber-500 to-yellow-700','classical mythological painting style',3,
   ARRAY['Aureus','Thalia','Kaida','Vareth','Isolde','Rhodan','Nyxara','Solvain','Kerath','Elyra','Draven','Maelis','Tarkan','Ovena','Zephyra'],
   ARRAY['the Bold','the Seer','of the Dunes','Stormcaller','the Undying','of the Nine Gates','Shieldbearer','the Wanderer','Sunblade','the Silent']),
 ('cyber-guardians','Cyber Guardians','Neon protectors of the machine cities','🤖','from-cyan-500 to-blue-700','neon cyberpunk mecha art',4,
   ARRAY['Neon','Chrome','Pulse','Vector','Cipher','Circuit','Static','Quantum','Hex','Byte','Volt','Rune','Prism','Delta','Zero'],
   ARRAY['Sentinel','Enforcer','Ronin','Operative','Warden','Unit','Reaper','Courier','Architect','Phantom']),
 ('ocean-depths','Ocean Depths','Bioluminescent guardians of the abyss','🌊','from-teal-500 to-blue-800','deep-sea bioluminescent art',5,
   ARRAY['Abyssal','Coral','Tidal','Glacier','Pearl','Lantern','Siren','Mariana','Kelp','Nautilus','Reef','Trench','Sapphire','Current','Mist'],
   ARRAY['Serpent','Guardian','Dancer','Sovereign','Drifter','Warden','Whisper','Titan','Hunter','Keeper']),
 ('wild-kingdom','Wild Kingdom','Majestic animals of every wilderness','🦁','from-lime-500 to-emerald-700','vivid wildlife illustration',6,
   ARRAY['Golden','Snow','Desert','Highland','River','Thunder','Silver','Night','Autumn','Jungle','Savanna','Arctic','Ridge','Emerald','Dawn'],
   ARRAY['Lion','Wolf','Tiger','Eagle','Panther','Bison','Fox','Falcon','Bear','Stag']),
 ('elemental-titans','Elemental Titans','Colossal beings born of fire, ice, stone and storm','🔥','from-orange-500 to-red-700','monumental elemental fantasy art',7,
   ARRAY['Magma','Glacial','Tempest','Granite','Cinder','Torrent','Gale','Quartz','Blaze','Frostbound','Dune','Thunderous','Molten','Rimefall','Stonewrought'],
   ARRAY['Titan','Colossus','Behemoth','Juggernaut','Monolith','Warlord','Giant','Bulwark','Ravager','Sovereign']),
 ('shadow-order','Shadow Order','Silent assassins and keepers of hidden knowledge','🌑','from-slate-700 to-purple-900','dark moody chiaroscuro art',8,
   ARRAY['Umbra','Nocturne','Silent','Veil','Dusk','Ravenous','Hollow','Whisper','Grim','Onyx','Pale','Wraith','Cinderfall','Mourning','Eclipse'],
   ARRAY['Blade','Stalker','Inquisitor','Shade','Keeper','Assassin','Nightwalker','Cabalist','Executioner','Hand']),
 ('cosmic-explorers','Cosmic Explorers','Pioneers charting impossible worlds','🚀','from-violet-500 to-sky-600','retro-futuristic sci-fi art',9,
   ARRAY['Captain','Navigator','Pilot','Scout','Commander','Ranger','Surveyor','Envoy','Pathfinder','Astronaut','Beacon','Drifter','Vanguard','Cartographer','Pioneer'],
   ARRAY['Aurelia','Kestrel','Halcyon','Meridian','Orbit','Perseus','Solace','Tycho','Vesper','Zenith']),
 ('enchanted-forest','Enchanted Forest','Fae, sprites and mushroom-lit woodland folk','🍄','from-emerald-500 to-teal-700','whimsical storybook fairytale art',10,
   ARRAY['Mossy','Fern','Willow','Thistle','Bramble','Acorn','Dewdrop','Toadstool','Hollow','Petal','Ivy','Birch','Glowcap','Lantern','Wisp'],
   ARRAY['Sprite','Faun','Dryad','Pixie','Elder','Guardian','Trickster','Weaver','Herald','Sage'])
) AS t(slug,name,description,emoji,gradient,art_style,sort_order,prefixes,suffixes);

INSERT INTO public.card_categories(slug,name,description,emoji,gradient,art_style,sort_order)
SELECT slug,name,description,emoji,gradient,art_style,sort_order FROM seed_cats;

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient)
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
  p.val || ' ' || s.val || ' — card #' || ((p.ord - 1) * 10 + s.ord) || ' of the ' || c.name || ' collection. ' || c.description || '.',
  c.emoji,
  c.gradient
FROM seed_cats c
CROSS JOIN LATERAL unnest(c.prefixes) WITH ORDINALITY AS p(val, ord)
CROSS JOIN LATERAL unnest(c.suffixes) WITH ORDINALITY AS s(val, ord);

INSERT INTO public.card_collectibles(category_slug, code, card_index, name, subject, rarity, lore, emoji, gradient, is_prime)
SELECT slug, slug || '-prime', 999, name || ' Prime', 'prime guardian', 'prime',
  'The golden Prime card of the ' || name || ' collection — awarded only to collectors who own every single card in the set.',
  '👑', gradient, true
FROM seed_cats;

CREATE OR REPLACE FUNCTION public.card_collection_leaderboard(_category text DEFAULT NULL, _limit integer DEFAULT 25)
RETURNS TABLE (user_id uuid, display_name text, avatar_url text, unique_cards bigint, total_cards bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT uc.user_id,
         p.full_name AS display_name,
         p.avatar_url,
         count(*)::bigint AS unique_cards,
         coalesce(sum(uc.copies), 0)::bigint AS total_cards
  FROM public.user_card_collection uc
  LEFT JOIN public.profiles p ON p.id = uc.user_id
  WHERE _category IS NULL OR uc.category_slug = _category
  GROUP BY uc.user_id, p.full_name, p.avatar_url
  ORDER BY unique_cards DESC, total_cards DESC
  LIMIT greatest(least(coalesce(_limit, 25), 100), 1)
$$;

GRANT EXECUTE ON FUNCTION public.card_collection_leaderboard(text, integer) TO anon, authenticated;

ALTER TABLE public.user_card_collection REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_card_collection;
