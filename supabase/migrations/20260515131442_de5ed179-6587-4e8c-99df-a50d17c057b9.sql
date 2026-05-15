
-- ============ FRIEND QUESTS ============
CREATE TABLE IF NOT EXISTS public.friend_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  target_value INT NOT NULL DEFAULT 100,
  progress_a INT NOT NULL DEFAULT 0,
  progress_b INT NOT NULL DEFAULT 0,
  reward_xp INT NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired','abandoned')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.friend_quest_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL,
  to_user UUID NOT NULL,
  quest_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

ALTER TABLE public.friend_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_quest_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants view friend quests" ON public.friend_quests;
DROP POLICY IF EXISTS "Participants insert friend quests" ON public.friend_quests;
DROP POLICY IF EXISTS "Participants update friend quests" ON public.friend_quests;
CREATE POLICY "Participants view friend quests" ON public.friend_quests FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Participants insert friend quests" ON public.friend_quests FOR INSERT WITH CHECK (auth.uid() = user_a);
CREATE POLICY "Participants update friend quests" ON public.friend_quests FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

DROP POLICY IF EXISTS "Users view their invites" ON public.friend_quest_invites;
DROP POLICY IF EXISTS "Users send invites" ON public.friend_quest_invites;
DROP POLICY IF EXISTS "Recipient updates invite" ON public.friend_quest_invites;
CREATE POLICY "Users view their invites" ON public.friend_quest_invites FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);
CREATE POLICY "Users send invites" ON public.friend_quest_invites FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "Recipient updates invite" ON public.friend_quest_invites FOR UPDATE USING (auth.uid() = to_user OR auth.uid() = from_user);

CREATE INDEX IF NOT EXISTS idx_fq_users ON public.friend_quests(user_a, user_b, status);
CREATE INDEX IF NOT EXISTS idx_fqi_to ON public.friend_quest_invites(to_user, status);

-- ============ GUILDS ============
CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emblem TEXT,
  banner_color TEXT DEFAULT '#7c3aed',
  level INT NOT NULL DEFAULT 1,
  total_xp BIGINT NOT NULL DEFAULT 0,
  member_count INT NOT NULL DEFAULT 1,
  max_members INT NOT NULL DEFAULT 50,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader','officer','member')),
  contributed_xp INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.guild_xp_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  xp_amount INT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_xp_contributions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_guild_member(_guild UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = _guild AND user_id = _user)
$$;

CREATE OR REPLACE FUNCTION public.is_guild_officer(_guild UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = _guild AND user_id = _user AND role IN ('leader','officer'))
$$;

DROP POLICY IF EXISTS "Anyone view guilds" ON public.guilds;
DROP POLICY IF EXISTS "Authenticated create guild" ON public.guilds;
DROP POLICY IF EXISTS "Officers update guild" ON public.guilds;
CREATE POLICY "Anyone view guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated create guild" ON public.guilds FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Officers update guild" ON public.guilds FOR UPDATE USING (public.is_guild_officer(id, auth.uid()));

DROP POLICY IF EXISTS "Anyone view members" ON public.guild_members;
DROP POLICY IF EXISTS "Users join guild" ON public.guild_members;
DROP POLICY IF EXISTS "Users leave guild" ON public.guild_members;
DROP POLICY IF EXISTS "Officers update member" ON public.guild_members;
CREATE POLICY "Anyone view members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Users join guild" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave guild" ON public.guild_members FOR DELETE USING (auth.uid() = user_id OR public.is_guild_officer(guild_id, auth.uid()));
CREATE POLICY "Officers update member" ON public.guild_members FOR UPDATE USING (public.is_guild_officer(guild_id, auth.uid()));

DROP POLICY IF EXISTS "Members view contributions" ON public.guild_xp_contributions;
DROP POLICY IF EXISTS "Members add contribution" ON public.guild_xp_contributions;
CREATE POLICY "Members view contributions" ON public.guild_xp_contributions FOR SELECT USING (public.is_guild_member(guild_id, auth.uid()));
CREATE POLICY "Members add contribution" ON public.guild_xp_contributions FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_guild_member(guild_id, auth.uid()));

CREATE INDEX IF NOT EXISTS idx_guild_members_user ON public.guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_xp_guild ON public.guild_xp_contributions(guild_id, created_at DESC);

-- ============ QUEST PATH ============
CREATE TABLE IF NOT EXISTS public.quest_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_number INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quest_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.quest_paths(id) ON DELETE CASCADE,
  node_index INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  required_xp INT NOT NULL DEFAULT 0,
  reward_type TEXT NOT NULL DEFAULT 'xp',
  reward_value INT NOT NULL DEFAULT 100,
  reward_label TEXT,
  is_boss BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(path_id, node_index)
);

CREATE TABLE IF NOT EXISTS public.user_quest_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_id UUID NOT NULL REFERENCES public.quest_paths(id) ON DELETE CASCADE,
  current_node INT NOT NULL DEFAULT 0,
  completed_nodes INT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, path_id)
);

ALTER TABLE public.quest_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_path_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view paths" ON public.quest_paths;
DROP POLICY IF EXISTS "Admins manage paths" ON public.quest_paths;
CREATE POLICY "Anyone view paths" ON public.quest_paths FOR SELECT USING (true);
CREATE POLICY "Admins manage paths" ON public.quest_paths FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Anyone view nodes" ON public.quest_nodes;
DROP POLICY IF EXISTS "Admins manage nodes" ON public.quest_nodes;
CREATE POLICY "Anyone view nodes" ON public.quest_nodes FOR SELECT USING (true);
CREATE POLICY "Admins manage nodes" ON public.quest_nodes FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Users view own path progress" ON public.user_quest_path_progress;
DROP POLICY IF EXISTS "Users insert own path progress" ON public.user_quest_path_progress;
DROP POLICY IF EXISTS "Users update own path progress" ON public.user_quest_path_progress;
CREATE POLICY "Users view own path progress" ON public.user_quest_path_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own path progress" ON public.user_quest_path_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own path progress" ON public.user_quest_path_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============ COSMETICS (rewards_*) ============
CREATE TABLE IF NOT EXISTS public.rewards_cosmetic_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('avatar_frame','profile_theme','animated_border','badge_skin','chat_bubble','name_color')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  preview_url TEXT,
  asset_url TEXT,
  price_xp INT,
  price_eur NUMERIC(10,2),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_rewards_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.rewards_cosmetic_items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.rewards_cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards_cosmetics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone view rewards cosmetic catalog" ON public.rewards_cosmetic_items;
DROP POLICY IF EXISTS "Admins manage rewards cosmetics" ON public.rewards_cosmetic_items;
CREATE POLICY "Anyone view rewards cosmetic catalog" ON public.rewards_cosmetic_items FOR SELECT USING (true);
CREATE POLICY "Admins manage rewards cosmetics" ON public.rewards_cosmetic_items FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

DROP POLICY IF EXISTS "Users view own rewards cosmetics" ON public.user_rewards_cosmetics;
DROP POLICY IF EXISTS "Users acquire rewards cosmetics" ON public.user_rewards_cosmetics;
DROP POLICY IF EXISTS "Users equip own rewards cosmetics" ON public.user_rewards_cosmetics;
CREATE POLICY "Users view own rewards cosmetics" ON public.user_rewards_cosmetics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users acquire rewards cosmetics" ON public.user_rewards_cosmetics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users equip own rewards cosmetics" ON public.user_rewards_cosmetics FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_rewards_cosmetics_user ON public.user_rewards_cosmetics(user_id);

-- ============ YEAR WRAPPED ============
CREATE TABLE IF NOT EXISTS public.user_year_wrapped (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  year INT NOT NULL,
  total_xp BIGINT NOT NULL DEFAULT 0,
  top_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  badges_earned INT NOT NULL DEFAULT 0,
  streak_max INT NOT NULL DEFAULT 0,
  highlights JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug TEXT UNIQUE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);

ALTER TABLE public.user_year_wrapped ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own wrapped" ON public.user_year_wrapped;
DROP POLICY IF EXISTS "Users insert own wrapped" ON public.user_year_wrapped;
DROP POLICY IF EXISTS "Users update own wrapped" ON public.user_year_wrapped;
CREATE POLICY "Users view own wrapped" ON public.user_year_wrapped FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users insert own wrapped" ON public.user_year_wrapped FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own wrapped" ON public.user_year_wrapped FOR UPDATE USING (auth.uid() = user_id);

-- ============ DONATE XP TO CHARITY ============
CREATE TABLE IF NOT EXISTS public.xp_charity_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID,
  campaign_name TEXT,
  xp_amount INT NOT NULL,
  eur_value NUMERIC(10,2) NOT NULL,
  conversion_rate INT NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','converted','transferred','failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.xp_charity_donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own donations" ON public.xp_charity_donations;
DROP POLICY IF EXISTS "Users create donations" ON public.xp_charity_donations;
DROP POLICY IF EXISTS "Admins manage donations" ON public.xp_charity_donations;
CREATE POLICY "Users view own donations" ON public.xp_charity_donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create donations" ON public.xp_charity_donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage donations" ON public.xp_charity_donations FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_xp_donations_user ON public.xp_charity_donations(user_id, created_at DESC);

-- ============ TRIGGERS ============
DROP TRIGGER IF EXISTS update_friend_quests_updated_at ON public.friend_quests;
CREATE TRIGGER update_friend_quests_updated_at BEFORE UPDATE ON public.friend_quests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_guilds_updated_at ON public.guilds;
CREATE TRIGGER update_guilds_updated_at BEFORE UPDATE ON public.guilds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_quest_path_progress_updated_at ON public.user_quest_path_progress;
CREATE TRIGGER update_user_quest_path_progress_updated_at BEFORE UPDATE ON public.user_quest_path_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
