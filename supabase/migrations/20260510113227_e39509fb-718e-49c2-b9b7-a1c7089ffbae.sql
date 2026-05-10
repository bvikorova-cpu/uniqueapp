
-- Brand Kit table
CREATE TABLE IF NOT EXISTS public.brand_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'My Brand',
  logo_url text,
  primary_color text DEFAULT '#7c3aed',
  secondary_color text DEFAULT '#ec4899',
  accent_color text DEFAULT '#fbbf24',
  font_heading text DEFAULT 'Inter',
  font_body text DEFAULT 'Inter',
  brand_voice_summary text,
  tagline text,
  do_list text[],
  dont_list text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_kits_select_own" ON public.brand_kits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "brand_kits_insert_own" ON public.brand_kits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "brand_kits_update_own" ON public.brand_kits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "brand_kits_delete_own" ON public.brand_kits FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_brand_kits_user ON public.brand_kits(user_id);

-- Winning Ads Library (curated/AI-generated examples - publicly readable)
CREATE TABLE IF NOT EXISTS public.winning_ads_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  platform text NOT NULL,
  brand_name text NOT NULL,
  ad_title text NOT NULL,
  hook text NOT NULL,
  full_script text,
  duration_seconds int DEFAULT 30,
  performance_metrics jsonb DEFAULT '{}'::jsonb,
  why_it_works text,
  thumbnail_url text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.winning_ads_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "winning_ads_select_authenticated" ON public.winning_ads_library
  FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_winning_ads_industry ON public.winning_ads_library(industry);
CREATE INDEX idx_winning_ads_platform ON public.winning_ads_library(platform);

-- Seed some initial winning ads
INSERT INTO public.winning_ads_library (industry, platform, brand_name, ad_title, hook, full_script, duration_seconds, performance_metrics, why_it_works, tags)
VALUES
  ('fitness', 'tiktok', 'Nike', 'Just Do It - Morning Run', 'You hit snooze. They didn''t.', 'Open on dark bedroom, alarm. Cut to runner already on track. "While you''re still in bed, champions are training." Logo + CTA.', 15, '{"views":"45M","ctr":"8.2%","engagement":"12%"}'::jsonb, 'Strong contrast hook in first 3s, FOMO trigger, simple CTA', ARRAY['hook','contrast','fomo']),
  ('saas', 'youtube', 'Notion', 'Replace 5 apps with one', 'Stop paying for 5 apps. This replaces them all.', 'Quick cuts of expensive app icons, then morphing into Notion. Demo of features. Free signup CTA.', 30, '{"views":"12M","ctr":"6.4%","conversion":"3.1%"}'::jsonb, 'Direct value prop, problem agitation, clear demo', ARRAY['valueprop','demo','saas']),
  ('ecommerce', 'instagram', 'Glossier', 'Skin first, makeup second', 'Real skin. Real people. Real glow.', 'Diverse faces, natural lighting, no filter. Product close-ups. UGC testimonials. Shop now.', 20, '{"views":"8M","ctr":"5.7%","sales_lift":"+34%"}'::jsonb, 'Authenticity, diversity, social proof, soft sell', ARRAY['authenticity','ugc','beauty']),
  ('food', 'tiktok', 'McDonalds', 'BTS - Spicy Chicken', 'POV: It''s 2am and you need this.', 'Phone POV ordering, drive-thru, first bite reaction. Quick cuts, trending audio.', 15, '{"views":"89M","ctr":"9.1%","engagement":"15%"}'::jsonb, 'POV format, relatable scenario, trending audio', ARRAY['pov','trending','relatable']),
  ('finance', 'youtube', 'Revolut', 'Travel without fees', 'Banks charge €30 abroad. We charge €0.', 'Split screen: traditional bank fees vs Revolut. Beach footage. Sign up CTA.', 30, '{"views":"5M","ctr":"7.2%","signups":"+45%"}'::jsonb, 'Direct cost comparison, aspirational visual, clear benefit', ARRAY['comparison','fintech','travel']),
  ('beauty', 'instagram', 'Fenty Beauty', '50 shades. Find yours.', 'Your shade exists. Promise.', 'Rapid carousel of 50 different skin tones with foundation match. Inclusive messaging.', 20, '{"views":"15M","ctr":"6.8%","engagement":"9%"}'::jsonb, 'Inclusivity hook, visual proof, emotional connection', ARRAY['inclusivity','visual','beauty']),
  ('education', 'youtube', 'Duolingo', '5 minutes a day = fluent', 'You waste 5 min on Instagram. Learn Spanish instead.', 'Instagram doom-scroll cut to Duolingo lesson, progress bar fills, character speaks Spanish.', 15, '{"views":"22M","ctr":"7.5%","installs":"+28%"}'::jsonb, 'Habit replacement angle, clear benefit, visual transformation', ARRAY['habit','transformation','education']),
  ('automotive', 'youtube', 'Tesla', 'Acceleration', '0 to 60 in 1.99s. No engine. No fuel.', 'Static car. Then blurred motion. Speedometer. Driver smiling. Tesla logo.', 15, '{"views":"30M","ctr":"5.1%","leads":"+20%"}'::jsonb, 'Sensory hook, performance proof, premium positioning', ARRAY['performance','premium','tech']);
