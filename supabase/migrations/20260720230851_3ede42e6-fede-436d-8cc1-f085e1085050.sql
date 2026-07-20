
-- Profiles (double-blind: only shows pseudonym + tags, never user_id externally)
CREATE TABLE public.exclusive_connection_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym TEXT NOT NULL,
  region TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  expertise TEXT[] NOT NULL DEFAULT '{}',
  seeking TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_connection_profiles TO authenticated;
GRANT ALL ON public.exclusive_connection_profiles TO service_role;

ALTER TABLE public.exclusive_connection_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read active profiles"
  ON public.exclusive_connection_profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Members manage own profile"
  ON public.exclusive_connection_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id AND public.is_exclusive_member(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.is_exclusive_member(auth.uid()));

CREATE POLICY "Admins manage all profiles"
  ON public.exclusive_connection_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_conn_profiles_updated
  BEFORE UPDATE ON public.exclusive_connection_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Interests: A expresses interest in B. When B also expresses interest in A → match.
CREATE TABLE public.exclusive_connection_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user, to_user),
  CHECK (from_user <> to_user)
);

GRANT SELECT, INSERT, DELETE ON public.exclusive_connection_interests TO authenticated;
GRANT ALL ON public.exclusive_connection_interests TO service_role;

ALTER TABLE public.exclusive_connection_interests ENABLE ROW LEVEL SECURITY;

-- A user can only see rows where they are involved (sent OR received).
CREATE POLICY "Members read own interests"
  ON public.exclusive_connection_interests FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = from_user OR auth.uid() = to_user)
    AND public.is_exclusive_member(auth.uid())
  );

CREATE POLICY "Members send interest"
  ON public.exclusive_connection_interests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user
    AND public.is_exclusive_member(auth.uid())
    AND public.is_exclusive_member(to_user)
  );

CREATE POLICY "Members withdraw own interest"
  ON public.exclusive_connection_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = from_user);

CREATE POLICY "Admins read interests"
  ON public.exclusive_connection_interests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_conn_interests_from ON public.exclusive_connection_interests(from_user);
CREATE INDEX idx_conn_interests_to ON public.exclusive_connection_interests(to_user);
CREATE INDEX idx_conn_profiles_active ON public.exclusive_connection_profiles(is_active) WHERE is_active = true;

-- Helper: does a mutual match exist between two users?
CREATE OR REPLACE FUNCTION public.exclusive_is_matched(_a UUID, _b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.exclusive_connection_interests
    WHERE from_user = _a AND to_user = _b
  ) AND EXISTS (
    SELECT 1 FROM public.exclusive_connection_interests
    WHERE from_user = _b AND to_user = _a
  );
$$;
