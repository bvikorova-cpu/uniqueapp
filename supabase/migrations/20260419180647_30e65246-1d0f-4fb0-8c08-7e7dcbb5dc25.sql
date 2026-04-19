CREATE TABLE IF NOT EXISTS public.lottery_dream_decoder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dream_text TEXT NOT NULL,
  symbols JSONB DEFAULT '[]'::jsonb,
  interpretation TEXT,
  suggested_numbers INTEGER[] DEFAULT '{}',
  lottery_type TEXT,
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lottery_dream_decoder ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ldd select own" ON public.lottery_dream_decoder;
DROP POLICY IF EXISTS "ldd insert own" ON public.lottery_dream_decoder;
DROP POLICY IF EXISTS "ldd delete own" ON public.lottery_dream_decoder;
CREATE POLICY "ldd select own" ON public.lottery_dream_decoder FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ldd insert own" ON public.lottery_dream_decoder FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ldd delete own" ON public.lottery_dream_decoder FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lottery_numerology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  life_path_number INTEGER,
  destiny_number INTEGER,
  soul_number INTEGER,
  lucky_numbers INTEGER[] DEFAULT '{}',
  power_days TEXT[] DEFAULT '{}',
  reading TEXT,
  credits_used INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lottery_numerology ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lnum select own" ON public.lottery_numerology;
DROP POLICY IF EXISTS "lnum insert own" ON public.lottery_numerology;
DROP POLICY IF EXISTS "lnum delete own" ON public.lottery_numerology;
CREATE POLICY "lnum select own" ON public.lottery_numerology FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lnum insert own" ON public.lottery_numerology FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lnum delete own" ON public.lottery_numerology FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lottery_syndicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  lottery_type TEXT NOT NULL DEFAULT 'eurojackpot',
  max_members INTEGER NOT NULL DEFAULT 10,
  total_winnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  shared_combinations JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lottery_syndicates ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.lottery_syndicate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID NOT NULL REFERENCES public.lottery_syndicates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (syndicate_id, user_id)
);
ALTER TABLE public.lottery_syndicate_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_lottery_syndicate_member(_syndicate_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.lottery_syndicate_members WHERE syndicate_id = _syndicate_id AND user_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.lottery_syndicates WHERE id = _syndicate_id AND owner_id = _user_id);
$$;

DROP POLICY IF EXISTS "lsynd select members" ON public.lottery_syndicates;
DROP POLICY IF EXISTS "lsynd insert owner" ON public.lottery_syndicates;
DROP POLICY IF EXISTS "lsynd update owner" ON public.lottery_syndicates;
DROP POLICY IF EXISTS "lsynd delete owner" ON public.lottery_syndicates;
CREATE POLICY "lsynd select members" ON public.lottery_syndicates FOR SELECT
  USING (public.is_lottery_syndicate_member(id, auth.uid()));
CREATE POLICY "lsynd insert owner" ON public.lottery_syndicates FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "lsynd update owner" ON public.lottery_syndicates FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "lsynd delete owner" ON public.lottery_syndicates FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "lsmem select members" ON public.lottery_syndicate_members;
DROP POLICY IF EXISTS "lsmem insert self" ON public.lottery_syndicate_members;
DROP POLICY IF EXISTS "lsmem delete self" ON public.lottery_syndicate_members;
CREATE POLICY "lsmem select members" ON public.lottery_syndicate_members FOR SELECT
  USING (public.is_lottery_syndicate_member(syndicate_id, auth.uid()));
CREATE POLICY "lsmem insert self" ON public.lottery_syndicate_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lsmem delete self" ON public.lottery_syndicate_members FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.lottery_heatmap_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lottery_type TEXT NOT NULL,
  hot_numbers INTEGER[] DEFAULT '{}',
  cold_numbers INTEGER[] DEFAULT '{}',
  frequency_data JSONB DEFAULT '{}'::jsonb,
  pair_affinity JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lottery_heatmap_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lheat select own" ON public.lottery_heatmap_snapshots;
DROP POLICY IF EXISTS "lheat insert own" ON public.lottery_heatmap_snapshots;
DROP POLICY IF EXISTS "lheat delete own" ON public.lottery_heatmap_snapshots;
CREATE POLICY "lheat select own" ON public.lottery_heatmap_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lheat insert own" ON public.lottery_heatmap_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lheat delete own" ON public.lottery_heatmap_snapshots FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trg_lottery_syndicates_updated ON public.lottery_syndicates;
CREATE TRIGGER trg_lottery_syndicates_updated
BEFORE UPDATE ON public.lottery_syndicates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_lottery_dream_user ON public.lottery_dream_decoder(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_numerology_user ON public.lottery_numerology(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_synd_owner ON public.lottery_syndicates(owner_id);
CREATE INDEX IF NOT EXISTS idx_lottery_synd_members_user ON public.lottery_syndicate_members(user_id);
CREATE INDEX IF NOT EXISTS idx_lottery_heatmap_user ON public.lottery_heatmap_snapshots(user_id, created_at DESC);