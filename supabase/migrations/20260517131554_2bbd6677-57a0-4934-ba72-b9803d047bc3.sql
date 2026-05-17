-- Section 3: Community Hero - nomination, employer verification, thank-you wall

ALTER TABLE public.hero_campaigns
  ADD COLUMN IF NOT EXISTS nominated_by_name text,
  ADD COLUMN IF NOT EXISTS nominated_by_email text,
  ADD COLUMN IF NOT EXISTS nominee_consent_status text NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS nomination_story text,
  ADD COLUMN IF NOT EXISTS employer_org_name text,
  ADD COLUMN IF NOT EXISTS employer_contact_email text,
  ADD COLUMN IF NOT EXISTS employer_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS employer_verifier_name text,
  ADD COLUMN IF NOT EXISTS employer_verification_status text NOT NULL DEFAULT 'unverified';

-- Thank-you wall messages (non-monetary appreciation)
CREATE TABLE IF NOT EXISTS public.hero_thank_you_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.hero_campaigns(id) ON DELETE CASCADE,
  author_user_id uuid,
  author_name text NOT NULL,
  message text NOT NULL CHECK (length(message) BETWEEN 3 AND 500),
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hero_thanks_campaign ON public.hero_thank_you_messages(campaign_id, created_at DESC);

ALTER TABLE public.hero_thank_you_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved thank-yous" ON public.hero_thank_you_messages;
CREATE POLICY "Anyone can view approved thank-yous"
  ON public.hero_thank_you_messages FOR SELECT
  USING (is_approved = true);

DROP POLICY IF EXISTS "Anyone can post a thank-you" ON public.hero_thank_you_messages;
CREATE POLICY "Anyone can post a thank-you"
  ON public.hero_thank_you_messages FOR INSERT
  WITH CHECK (length(trim(author_name)) > 0 AND length(trim(message)) >= 3);

DROP POLICY IF EXISTS "Authors can delete own thank-yous" ON public.hero_thank_you_messages;
CREATE POLICY "Authors can delete own thank-yous"
  ON public.hero_thank_you_messages FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = author_user_id);
