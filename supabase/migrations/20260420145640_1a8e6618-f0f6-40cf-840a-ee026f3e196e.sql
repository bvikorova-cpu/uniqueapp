-- ============= SUPPORT TICKETS =============
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'support',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  ai_suggested_category TEXT,
  ai_suggested_faq_id UUID,
  sentiment TEXT,
  language TEXT DEFAULT 'en',
  attachments JSONB DEFAULT '[]'::jsonb,
  voice_url TEXT,
  screen_recording_url TEXT,
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  satisfaction_rating INTEGER,
  satisfaction_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Anyone can create a ticket"
  ON public.support_tickets FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() = user_id)
  );

CREATE POLICY "Users can update their own ticket rating"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete tickets"
  ON public.support_tickets FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  yr TEXT;
BEGIN
  yr := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 'TKT-' || yr || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.support_tickets
    WHERE ticket_number LIKE 'TKT-' || yr || '-%';
  NEW.ticket_number := 'TKT-' || yr || '-' || lpad(next_num::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_ticket_number
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL)
EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============= TICKET MESSAGES (thread) =============
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see messages for their tickets"
  ON public.support_ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    )
  );

CREATE POLICY "Users can post on their tickets"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
    )
  );

-- ============= FAQ =============
CREATE TABLE public.support_faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  views_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_faq_category ON public.support_faq(category);

ALTER TABLE public.support_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active FAQ"
  ON public.support_faq FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage FAQ"
  ON public.support_faq FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_support_faq_updated_at
BEFORE UPDATE ON public.support_faq
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============= SYSTEM STATUS =============
CREATE TABLE public.system_status_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'operational',
  display_order INTEGER NOT NULL DEFAULT 0,
  uptime_30d NUMERIC(5,2) DEFAULT 100.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_status_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read status components"
  ON public.system_status_components FOR SELECT
  USING (true);

CREATE POLICY "Admins manage status components"
  ON public.system_status_components FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.system_status_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  component_id UUID REFERENCES public.system_status_components(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor',
  status TEXT NOT NULL DEFAULT 'investigating',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_system_status_incidents_started ON public.system_status_incidents(started_at DESC);

ALTER TABLE public.system_status_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read incidents"
  ON public.system_status_incidents FOR SELECT
  USING (true);

CREATE POLICY "Admins manage incidents"
  ON public.system_status_incidents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============= STORAGE BUCKET =============
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  ARRAY['image/png','image/jpeg','image/webp','image/gif','video/webm','video/mp4','audio/webm','audio/mpeg','audio/wav','application/pdf','text/plain']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload to their support folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'support-attachments'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'anonymous')
  );

CREATE POLICY "Users read their support attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support-attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'moderator')
    )
  );

CREATE POLICY "Admins delete support attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'support-attachments'
    AND public.has_role(auth.uid(), 'admin')
  );

-- ============= SEED FAQ =============
INSERT INTO public.support_faq (category, question, answer, keywords, display_order) VALUES
('billing', 'How do I top up my AI credits?', 'Go to AI Credits page, choose a credit pack and pay via Stripe. Credits are added instantly to your balance.', ARRAY['credits','top up','payment','stripe','ai'], 1),
('billing', 'Can I get a refund for unused credits?', 'Credits are non-refundable. However, they never expire and can be used across all AI tools on the platform.', ARRAY['refund','credits','money'], 2),
('account', 'How do I change my email or password?', 'Open Settings → Account. You can update your email and reset password from there. A confirmation email will be sent.', ARRAY['password','email','account','settings'], 3),
('account', 'How do I delete my account?', 'Settings → Account → Delete Account. This is permanent and removes all your data, content and credits.', ARRAY['delete','remove','account','gdpr'], 4),
('payouts', 'How long do payouts take?', 'Stripe Connect & PayPal: 1–2 business days. Wise: same day. Crypto (USDT/USDC): under 30 minutes.', ARRAY['payout','withdrawal','money','earnings'], 5),
('payouts', 'What is the minimum payout amount?', 'Minimum payout is €25 for all methods. Below this threshold balance accumulates until it is reached.', ARRAY['minimum','payout','threshold'], 6),
('technical', 'Why is AI generation slow or failing?', 'Check our system status page. If everything is operational, try a smaller prompt. Heavy load can cause queue waits up to 30 seconds.', ARRAY['ai','slow','error','generation','fail'], 7),
('technical', 'Which browsers are supported?', 'Latest Chrome, Edge, Safari, Firefox, and Brave. Mobile Safari & Chrome on Android are fully supported.', ARRAY['browser','support','chrome','safari'], 8),
('general', 'Is there a mobile app?', 'The web app is fully PWA-installable on iOS and Android — add it to your home screen for an app-like experience.', ARRAY['mobile','app','pwa','ios','android'], 9),
('general', 'How do I report a bug?', 'Use this Contact form, choose category "Bug report", attach a screenshot or screen recording — our team gets it instantly.', ARRAY['bug','report','issue','problem'], 10);

-- ============= SEED STATUS COMPONENTS =============
INSERT INTO public.system_status_components (name, slug, description, status, display_order) VALUES
('Web Application', 'web', 'Main website and user dashboard', 'operational', 1),
('AI Generation Engine', 'ai-engine', 'Image, text and music generation', 'operational', 2),
('Payments & Stripe', 'payments', 'Checkout, subscriptions and payouts', 'operational', 3),
('Database & Storage', 'database', 'User data, files and media storage', 'operational', 4)
ON CONFLICT (slug) DO NOTHING;