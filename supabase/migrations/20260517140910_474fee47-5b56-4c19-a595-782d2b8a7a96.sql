
-- Add moderation columns to all fundraising campaign tables
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'medical_campaigns',
    'dream_campaigns',
    'hero_campaigns',
    'crisis_campaigns',
    'pet_rescue_campaigns',
    'student_campaigns',
    'talent_campaigns'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT ''pending''', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approval_notes TEXT', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_by UUID', t);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_approval_status ON public.%I(approval_status)', t, t);
  END LOOP;
END $$;

-- Admin moderation audit details view (uses existing admin_audit_log)
-- No new tables — admins use existing admin_audit_log via action='fundraising_moderation'
