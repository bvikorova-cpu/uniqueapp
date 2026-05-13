
-- Feature flags
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  rollout_percent INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percent BETWEEN 0 AND 100),
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read enabled flags" ON public.feature_flags
  FOR SELECT USING (enabled = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage flags" ON public.feature_flags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_feature_flags_updated
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Email templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, language)
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage templates" ON public.email_templates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_email_templates_updated
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bulk user action log
CREATE TABLE public.bulk_user_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_user_ids UUID[] NOT NULL DEFAULT '{}',
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  performed_by UUID,
  succeeded_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bulk_user_action_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read bulk log" ON public.bulk_user_action_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
