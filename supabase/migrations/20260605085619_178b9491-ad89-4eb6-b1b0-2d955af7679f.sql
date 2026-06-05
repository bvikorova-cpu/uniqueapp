-- H7
CREATE OR REPLACE FUNCTION public.get_or_create_megatalent_referral_code()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE _uid uuid := auth.uid(); _code text; _attempts int := 0;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT code INTO _code FROM public.megatalent_referral_codes WHERE user_id = _uid;
  IF _code IS NOT NULL THEN RETURN _code; END IF;
  LOOP
    _attempts := _attempts + 1;
    _code := 'MT' || upper(substr(regexp_replace(encode(extensions.gen_random_bytes(8), 'base64'), '[^A-Za-z0-9]', '', 'g'), 1, 6));
    IF length(_code) < 6 THEN CONTINUE; END IF;
    BEGIN
      INSERT INTO public.megatalent_referral_codes (user_id, code) VALUES (_uid, _code);
      RETURN _code;
    EXCEPTION WHEN unique_violation THEN
      IF _attempts > 10 THEN RAISE EXCEPTION 'code_generation_failed'; END IF;
    END;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.get_or_create_megatalent_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_megatalent_referral_code() TO authenticated;
DROP POLICY IF EXISTS "Users can create their own referral code" ON public.megatalent_referral_codes;

-- H8
CREATE INDEX IF NOT EXISTS idx_talent_submissions_votes_desc
  ON public.talent_submissions (votes_count DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_talent_submissions_created_desc
  ON public.talent_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_talent_submissions_category_votes
  ON public.talent_submissions (category, votes_count DESC) WHERE is_active = true;

-- H10
CREATE TABLE IF NOT EXISTS public.mt_user_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.mt_user_onboarding TO authenticated;
GRANT ALL ON public.mt_user_onboarding TO service_role;
ALTER TABLE public.mt_user_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own onboarding" ON public.mt_user_onboarding
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "user marks own onboarding" ON public.mt_user_onboarding
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- H11
CREATE OR REPLACE FUNCTION public.mt_get_duel_pair(_categories text[] DEFAULT NULL)
RETURNS TABLE (id uuid, user_id uuid, title text, media_url text, media_type text, votes_count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH pool AS (
    SELECT s.id, s.user_id, s.title, s.media_url, s.media_type, s.votes_count
    FROM public.talent_submissions s
    WHERE s.is_active = true
      AND (_categories IS NULL OR s.category::text = ANY(_categories))
    ORDER BY s.votes_count DESC
    LIMIT 20
  )
  SELECT * FROM pool ORDER BY random() LIMIT 2;
$$;
REVOKE ALL ON FUNCTION public.mt_get_duel_pair(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mt_get_duel_pair(text[]) TO authenticated, anon;