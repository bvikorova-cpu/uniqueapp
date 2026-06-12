
ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS id_document_url text,
  ADD COLUMN IF NOT EXISTS social_proof_url text,
  ADD COLUMN IF NOT EXISTS verification_notes text,
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_reason text;

CREATE TABLE IF NOT EXISTS public.reserved_artist_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_normalized text UNIQUE NOT NULL,
  display_name text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

GRANT SELECT ON public.reserved_artist_names TO authenticated, anon;
GRANT ALL ON public.reserved_artist_names TO service_role;
ALTER TABLE public.reserved_artist_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reserved names"
  ON public.reserved_artist_names FOR SELECT USING (true);
CREATE POLICY "Admins manage reserved names"
  ON public.reserved_artist_names FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.reserved_artist_names (name_normalized, display_name, reason) VALUES
  ('shakira','Shakira','World-famous artist'),
  ('beyonce','Beyoncé','World-famous artist'),
  ('adele','Adele','World-famous artist'),
  ('taylor swift','Taylor Swift','World-famous artist'),
  ('rihanna','Rihanna','World-famous artist'),
  ('drake','Drake','World-famous artist'),
  ('ed sheeran','Ed Sheeran','World-famous artist'),
  ('billie eilish','Billie Eilish','World-famous artist'),
  ('the weeknd','The Weeknd','World-famous artist'),
  ('bruno mars','Bruno Mars','World-famous artist'),
  ('madonna','Madonna','World-famous artist'),
  ('lady gaga','Lady Gaga','World-famous artist'),
  ('justin bieber','Justin Bieber','World-famous artist'),
  ('ariana grande','Ariana Grande','World-famous artist'),
  ('coldplay','Coldplay','World-famous band'),
  ('metallica','Metallica','World-famous band'),
  ('bts','BTS','World-famous group'),
  ('blackpink','BLACKPINK','World-famous group')
ON CONFLICT (name_normalized) DO NOTHING;

CREATE OR REPLACE FUNCTION public.check_reserved_artist_name()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_normalized text; v_reserved boolean;
BEGIN
  v_normalized := lower(trim(NEW.stage_name));
  SELECT EXISTS (SELECT 1 FROM public.reserved_artist_names WHERE name_normalized = v_normalized) INTO v_reserved;
  IF v_reserved AND COALESCE(NEW.verified, false) = false THEN
    RAISE EXCEPTION 'Stage name "%" is reserved for verified artists only. Submit a verification request.', NEW.stage_name USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS musician_reserved_name_check ON public.musician_profiles;
CREATE TRIGGER musician_reserved_name_check
  BEFORE INSERT OR UPDATE OF stage_name ON public.musician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_reserved_artist_name();

CREATE TABLE IF NOT EXISTS public.concert_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id uuid NOT NULL REFERENCES public.live_concert_streams(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  category text NOT NULL DEFAULT 'impersonation',
  details text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  action_taken text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.concert_reports TO authenticated;
GRANT ALL ON public.concert_reports TO service_role;
ALTER TABLE public.concert_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reports" ON public.concert_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users see own reports" ON public.concert_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins see all reports" ON public.concert_reports
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.concert_reports
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS concert_reports_status_idx ON public.concert_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS concert_reports_concert_idx ON public.concert_reports(concert_id);
