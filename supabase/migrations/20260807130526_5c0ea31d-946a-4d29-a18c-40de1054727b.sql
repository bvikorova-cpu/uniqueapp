CREATE TABLE IF NOT EXISTS public.guess_age_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  photo_path text NOT NULL,
  age_in_photo integer NOT NULL,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guess_age_photos TO authenticated;
GRANT ALL ON public.guess_age_photos TO service_role;

ALTER TABLE public.guess_age_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own guess age photos"
ON public.guess_age_photos FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_guess_age_photos_user ON public.guess_age_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_guess_age_photos_active ON public.guess_age_photos(is_active);

CREATE TRIGGER update_guess_age_photos_updated_at
BEFORE UPDATE ON public.guess_age_photos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.guess_age_guesses
  ADD COLUMN IF NOT EXISTS photo_id uuid REFERENCES public.guess_age_photos(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guess_age_guesses_unique_photo
  ON public.guess_age_guesses(guesser_id, photo_id) WHERE photo_id IS NOT NULL;

INSERT INTO public.guess_age_photos (user_id, photo_path, age_in_photo, label, is_active, created_at)
SELECT p.user_id, p.photo_path, p.real_age, 'Current selfie', COALESCE(p.is_active, true), COALESCE(p.created_at, now())
FROM public.guess_age_profiles p
WHERE p.photo_path IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.guess_age_photos gp
    WHERE gp.user_id = p.user_id AND gp.photo_path = p.photo_path
  );