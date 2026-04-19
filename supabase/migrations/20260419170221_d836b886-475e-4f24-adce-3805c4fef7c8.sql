ALTER TABLE public.anonymous_dating_profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS preferred_gender TEXT,
ADD COLUMN IF NOT EXISTS relationship_goal TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[];

CREATE INDEX IF NOT EXISTS idx_anon_dating_profiles_location ON public.anonymous_dating_profiles(location);
CREATE INDEX IF NOT EXISTS idx_anon_dating_profiles_relationship_goal ON public.anonymous_dating_profiles(relationship_goal);