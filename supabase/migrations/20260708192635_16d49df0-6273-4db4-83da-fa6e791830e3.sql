
-- Interactive workshops catalog
CREATE TABLE public.interactive_workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  schedule TEXT NOT NULL,
  start_date DATE,
  max_participants INTEGER NOT NULL DEFAULT 20,
  level TEXT NOT NULL DEFAULT 'All Levels',
  image_url TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  includes TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.interactive_workshops TO anon, authenticated;
GRANT ALL ON public.interactive_workshops TO service_role;
ALTER TABLE public.interactive_workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workshops are public" ON public.interactive_workshops FOR SELECT USING (is_published);
CREATE POLICY "Admins manage workshops" ON public.interactive_workshops FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.interactive_workshop_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.interactive_workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workshop_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.interactive_workshop_enrollments TO authenticated;
GRANT ALL ON public.interactive_workshop_enrollments TO service_role;
ALTER TABLE public.interactive_workshop_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enrollment counts are public" ON public.interactive_workshop_enrollments FOR SELECT USING (true);
CREATE POLICY "Users enroll themselves" ON public.interactive_workshop_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unenroll themselves" ON public.interactive_workshop_enrollments FOR DELETE USING (auth.uid() = user_id);

-- Custom / topic suggestion inbox
CREATE TABLE public.workshop_topic_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  kind TEXT NOT NULL CHECK (kind IN ('custom_request','topic')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.workshop_topic_suggestions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.workshop_topic_suggestions TO service_role;
ALTER TABLE public.workshop_topic_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits suggestion" ON public.workshop_topic_suggestions FOR INSERT WITH CHECK (length(content) BETWEEN 3 AND 2000);
CREATE POLICY "Admins review suggestions" ON public.workshop_topic_suggestions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- MasterChef cooking timer sessions
CREATE TABLE public.masterchef_cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dish_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.masterchef_cooking_sessions TO authenticated;
GRANT ALL ON public.masterchef_cooking_sessions TO service_role;
ALTER TABLE public.masterchef_cooking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions" ON public.masterchef_cooking_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.masterchef_cooking_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON public.masterchef_cooking_sessions FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER trg_interactive_workshops_updated
  BEFORE UPDATE ON public.interactive_workshops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial workshops
INSERT INTO public.interactive_workshops (slug, title, description, instructor, price_cents, duration, schedule, start_date, max_participants, level, image_url, skills, includes, sort_order) VALUES
('coding-bootcamp','Full-Stack Coding Bootcamp','Build real-world projects with hands-on guidance','Sarah Johnson',19900,'4 weeks','Mon & Wed, 6-8 PM EST','2026-08-01',15,'Intermediate','https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',ARRAY['React','Node.js','MongoDB','Git'],ARRAY['Live coding sessions','Code reviews','Career guidance','Certificate'],10),
('design-sprint','UX Design Sprint Workshop','Learn Google''s design sprint methodology','David Park',14900,'1 week','Daily, 10 AM - 12 PM PST','2026-08-05',12,'All Levels','https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',ARRAY['Design Thinking','Prototyping','User Testing','Figma'],ARRAY['Daily exercises','Portfolio project','Feedback sessions','Templates'],20),
('data-analytics','Data Analytics Intensive','Master data analysis with Python and SQL','Dr. Maria Garcia',17900,'3 weeks','Tue & Thu, 7-9 PM EST','2026-08-10',20,'Beginner','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',ARRAY['Python','Pandas','SQL','Data Visualization'],ARRAY['Real datasets','Interactive notebooks','Project showcase','Job prep'],30),
('content-creation','Content Creation ProClass','Build your personal brand and online presence','Alex Rivera',12900,'2 weeks','Sat & Sun, 2-4 PM EST','2026-08-08',25,'All Levels','https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',ARRAY['Video Creation','Social Media','SEO','Storytelling'],ARRAY['Content calendar','Analytics tools','Brand kit','Growth strategies'],40),
('agile-scrum','Agile & Scrum Practitioner','Become a certified Scrum Master','Michael Chen',24900,'2 weeks','Mon, Wed, Fri, 5-7 PM GMT','2026-08-03',15,'Intermediate','https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',ARRAY['Scrum Framework','Sprint Planning','Team Leadership','Tools'],ARRAY['Certification prep','Mock exams','Case studies','PSM I exam'],50),
('public-speaking','Public Speaking Excellence','Overcome fear and deliver powerful presentations','Emma Thompson',15900,'3 weeks','Wed & Fri, 6-8 PM EST','2026-08-12',10,'All Levels','https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',ARRAY['Voice Modulation','Body Language','Storytelling','Confidence'],ARRAY['Live practice','Video feedback','Speech templates','Peer reviews'],60);
