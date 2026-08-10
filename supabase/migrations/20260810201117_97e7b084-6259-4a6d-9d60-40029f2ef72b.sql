CREATE TABLE IF NOT EXISTS public.hero_collectibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  archetype text NOT NULL,
  faction text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  lore text NOT NULL DEFAULT '',
  hp integer NOT NULL DEFAULT 100,
  attack integer NOT NULL DEFAULT 50,
  defense integer NOT NULL DEFAULT 50,
  speed integer NOT NULL DEFAULT 50,
  emoji text NOT NULL DEFAULT '🛡️',
  gradient text NOT NULL DEFAULT 'from-slate-500 to-slate-700',
  image_url text,
  times_collected integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_collectibles TO anon;
GRANT SELECT ON public.hero_collectibles TO authenticated;
GRANT ALL ON public.hero_collectibles TO service_role;

ALTER TABLE public.hero_collectibles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero collectibles are viewable by everyone"
ON public.hero_collectibles FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.hero_collection_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collectible_id uuid NOT NULL REFERENCES public.hero_collectibles(id) ON DELETE CASCADE,
  credits_spent integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, collectible_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_collection_cards TO authenticated;
GRANT ALL ON public.hero_collection_cards TO service_role;

ALTER TABLE public.hero_collection_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own collected hero cards"
ON public.hero_collection_cards FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_hero_collection_cards_user ON public.hero_collection_cards(user_id);

CREATE TRIGGER update_hero_collectibles_updated_at
BEFORE UPDATE ON public.hero_collectibles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hero_collection_cards_updated_at
BEFORE UPDATE ON public.hero_collection_cards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hero_collectibles (code, name, archetype, faction, rarity, lore, hp, attack, defense, speed, emoji, gradient)
SELECT
  'HC' || lpad(i::text, 3, '0'),
  fn || ' ' || ln,
  arch,
  fac,
  rar,
  'A ' || arch || ' sworn to the ' || fac || '. Legends say ' || fn || ' has never lost the same battle twice.',
  (90 + (abs(hashtext('hp' || i)) % 61) * mul)::int,
  (40 + (abs(hashtext('at' || i)) % 56) * mul)::int,
  (35 + (abs(hashtext('de' || i)) % 56) * mul)::int,
  (35 + (abs(hashtext('sp' || i)) % 56) * mul)::int,
  CASE rar WHEN 'legendary' THEN '👑' WHEN 'epic' THEN '🔥' WHEN 'rare' THEN '⚔️' ELSE '🛡️' END,
  CASE rar
    WHEN 'legendary' THEN 'from-amber-400 to-orange-600'
    WHEN 'epic' THEN 'from-fuchsia-500 to-purple-700'
    WHEN 'rare' THEN 'from-sky-500 to-blue-700'
    ELSE 'from-slate-500 to-slate-700'
  END
FROM (
  SELECT
    i,
    (ARRAY['Astra','Vorn','Kael','Nyx','Zephyr','Ignis','Thorne','Lyra','Draven','Sable','Orin','Vesper','Rune','Halcyon','Mirek','Onyx','Solace','Kyra','Aster','Fenrik','Quill','Talon','Umbra','Volta','Wren','Xander','Yara','Zoran','Bastion','Cinder','Dahlia','Ember','Fable','Grim','Hollow','Iris','Jarek','Krux','Lumen','Morrow','Nova','Obsid','Pyre','Quasar','Riven','Storm','Tempest','Ursa','Vail','Wraith'])[((i - 1) % 50) + 1] AS fn,
    (ARRAY['the Unbroken','Stormcaller','of the Ashen Vale','Voidwalker','the Radiant','Ironheart','Nightbloom','the Eternal','Sunforged','Dreadwing','the Silent','Frostbound','Emberlash','Skyrender','the Nameless','Starweaver','Thunderjaw','Gravemarch','the Kind','Lightbreaker'])[(((i - 1) / 50) % 20) + 1] AS ln,
    (ARRAY['armored guardian','cosmic sorcerer','shadow assassin','beast tamer','tech vigilante','elemental titan','time bender','sky knight','plague healer','psychic monk'])[(abs(hashtext('arch' || i)) % 10) + 1] AS arch,
    (ARRAY['Solar Vanguard','Void Syndicate','Emberforge Clan','Frost Covenant','Storm Legion','Verdant Order','Neon Republic','Ashen Wardens'])[(abs(hashtext('fac' || i)) % 8) + 1] AS fac,
    CASE
      WHEN i % 25 = 0 THEN 'legendary'
      WHEN i % 9 = 0 THEN 'epic'
      WHEN i % 4 = 0 THEN 'rare'
      ELSE 'common'
    END AS rar,
    CASE
      WHEN i % 25 = 0 THEN 2.1
      WHEN i % 9 = 0 THEN 1.6
      WHEN i % 4 = 0 THEN 1.25
      ELSE 1.0
    END AS mul
  FROM generate_series(1, 200) AS i
) s
ON CONFLICT (code) DO NOTHING;