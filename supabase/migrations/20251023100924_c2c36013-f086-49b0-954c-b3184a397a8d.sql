-- Fashion Categories (hlavné kategórie oblečenia)
CREATE TABLE IF NOT EXISTS public.fashion_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_category_id UUID REFERENCES public.fashion_categories(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Styles (štýly dizajnu)
CREATE TABLE IF NOT EXISTS public.fashion_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Materials (materiály)
CREATE TABLE IF NOT EXISTS public.fashion_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Designs (vygenerované návrhy)
CREATE TABLE IF NOT EXISTS public.fashion_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.fashion_categories(id),
  style_id UUID REFERENCES public.fashion_styles(id),
  material_id UUID REFERENCES public.fashion_materials(id),
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 50,
  quality_level TEXT CHECK (quality_level IN ('basic', 'detailed', 'premium', 'collection')) DEFAULT 'basic',
  colors TEXT[], -- array of color codes
  details JSONB, -- extra detaily (gombíky, zips, atď)
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Subscriptions (predplatné)
CREATE TABLE IF NOT EXISTS public.fashion_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT CHECK (tier IN ('hobby', 'professional', 'business')) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  price_czk INTEGER NOT NULL,
  features JSONB,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Marketplace Listings (predaj návrhov)
CREATE TABLE IF NOT EXISTS public.fashion_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES public.fashion_designs(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_czk INTEGER NOT NULL,
  license_type TEXT CHECK (license_type IN ('single', 'collection', 'full_rights')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Purchases (nákupy návrhov)
CREATE TABLE IF NOT EXISTS public.fashion_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.fashion_marketplace(id) ON DELETE CASCADE NOT NULL,
  design_id UUID REFERENCES public.fashion_designs(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price_paid_czk INTEGER NOT NULL,
  commission_czk INTEGER NOT NULL, -- 30% provízia
  license_type TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Likes (lajky návrhov)
CREATE TABLE IF NOT EXISTS public.fashion_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  design_id UUID REFERENCES public.fashion_designs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, design_id)
);

-- Fashion Follows (sledovanie dizajnérov)
CREATE TABLE IF NOT EXISTS public.fashion_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Fashion Challenges (súťaže)
CREATE TABLE IF NOT EXISTS public.fashion_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fashion Challenge Submissions (príspevky do súťaží)
CREATE TABLE IF NOT EXISTS public.fashion_challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.fashion_challenges(id) ON DELETE CASCADE NOT NULL,
  design_id UUID REFERENCES public.fashion_designs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  votes_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, design_id)
);

-- Fashion Challenge Votes (hlasovanie v súťažiach)
CREATE TABLE IF NOT EXISTS public.fashion_challenge_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.fashion_challenge_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

-- Enable RLS
ALTER TABLE public.fashion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_challenge_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fashion_categories (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.fashion_categories FOR SELECT USING (true);

-- RLS Policies for fashion_styles (public read)
CREATE POLICY "Styles are viewable by everyone" ON public.fashion_styles FOR SELECT USING (true);

-- RLS Policies for fashion_materials (public read)
CREATE POLICY "Materials are viewable by everyone" ON public.fashion_materials FOR SELECT USING (true);

-- RLS Policies for fashion_designs
CREATE POLICY "Public designs are viewable by everyone" ON public.fashion_designs 
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own designs" ON public.fashion_designs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" ON public.fashion_designs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" ON public.fashion_designs 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fashion_subscriptions
CREATE POLICY "Users can view their own subscription" ON public.fashion_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscription" ON public.fashion_subscriptions 
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for fashion_marketplace
CREATE POLICY "Marketplace listings are viewable by everyone" ON public.fashion_marketplace 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can create their own listings" ON public.fashion_marketplace 
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" ON public.fashion_marketplace 
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own listings" ON public.fashion_marketplace 
  FOR DELETE USING (auth.uid() = seller_id);

-- RLS Policies for fashion_purchases
CREATE POLICY "Users can view their own purchases" ON public.fashion_purchases 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchases" ON public.fashion_purchases 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for fashion_likes
CREATE POLICY "Likes are viewable by everyone" ON public.fashion_likes FOR SELECT USING (true);

CREATE POLICY "Users can like designs" ON public.fashion_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike designs" ON public.fashion_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fashion_follows
CREATE POLICY "Follows are viewable by everyone" ON public.fashion_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.fashion_follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.fashion_follows 
  FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for fashion_challenges
CREATE POLICY "Challenges are viewable by everyone" ON public.fashion_challenges FOR SELECT USING (true);

-- RLS Policies for fashion_challenge_submissions
CREATE POLICY "Submissions are viewable by everyone" ON public.fashion_challenge_submissions FOR SELECT USING (true);

CREATE POLICY "Users can submit their designs" ON public.fashion_challenge_submissions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their submissions" ON public.fashion_challenge_submissions 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fashion_challenge_votes
CREATE POLICY "Votes are viewable by everyone" ON public.fashion_challenge_votes FOR SELECT USING (true);

CREATE POLICY "Users can vote" ON public.fashion_challenge_votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote" ON public.fashion_challenge_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers pre update timestamps
CREATE TRIGGER update_fashion_designs_updated_at
  BEFORE UPDATE ON public.fashion_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fashion_subscriptions_updated_at
  BEFORE UPDATE ON public.fashion_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fashion_marketplace_updated_at
  BEFORE UPDATE ON public.fashion_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pre update likes count
CREATE OR REPLACE FUNCTION update_fashion_design_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fashion_designs
    SET likes_count = likes_count + 1
    WHERE id = NEW.design_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fashion_designs
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.design_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_fashion_design_likes
  AFTER INSERT OR DELETE ON public.fashion_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_fashion_design_likes_count();

-- Trigger pre update challenge votes count
CREATE OR REPLACE FUNCTION update_challenge_submission_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fashion_challenge_submissions
    SET votes_count = votes_count + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fashion_challenge_submissions
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_challenge_submission_votes
  AFTER INSERT OR DELETE ON public.fashion_challenge_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_submission_votes_count();

-- Trigger pre update marketplace sales count
CREATE OR REPLACE FUNCTION update_marketplace_sales_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fashion_marketplace
  SET sales_count = sales_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_marketplace_sales
  AFTER INSERT ON public.fashion_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_sales_count();

-- Seed data pre kategórie
INSERT INTO public.fashion_categories (name, slug, description, icon) VALUES
('Svadobné', 'wedding', 'Svadobné oblečenie', 'Heart'),
('Spoločenské', 'formal', 'Spoločenské a večerné oblečenie', 'Sparkles'),
('Detské', 'children', 'Oblečenie pre deti všetkých vekových kategórií', 'Baby'),
('Sezónne', 'seasonal', 'Sezónne oblečenie', 'CloudSun'),
('Plavky', 'swimwear', 'Plavky a plážové oblečenie', 'Waves'),
('Špeciálne Veľkosti', 'special-sizes', 'Oblečenie pre špeciálne veľkosti', 'Ruler')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories pre Svadobné
INSERT INTO public.fashion_categories (name, slug, description, parent_category_id) 
SELECT 'Svadobné šaty - Princezná', 'wedding-dress-princess', 'Šaty princezná štýl', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fashion_categories (name, slug, description, parent_category_id)
SELECT 'Svadobné šaty - Morská panna', 'wedding-dress-mermaid', 'Šaty morská panna štýl', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fashion_categories (name, slug, description, parent_category_id)
SELECT 'Svadobné šaty - A-línia', 'wedding-dress-a-line', 'Šaty A-línia štýl', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fashion_categories (name, slug, description, parent_category_id)
SELECT 'Svadobné šaty - Boho', 'wedding-dress-boho', 'Šaty boho štýl', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fashion_categories (name, slug, description, parent_category_id)
SELECT 'Popolničky/Družičky', 'bridesmaids', 'Šaty pre popolničky a družičky', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fashion_categories (name, slug, description, parent_category_id)
SELECT 'Svadobné obleky pre pánov', 'wedding-suits', 'Obleky pre ženíchov', id FROM public.fashion_categories WHERE slug = 'wedding'
ON CONFLICT (slug) DO NOTHING;

-- Seed data pre štýly
INSERT INTO public.fashion_styles (name, slug, description) VALUES
('Vintage', 'vintage', 'Retro a vintage štýl'),
('Modern', 'modern', 'Moderný a minimalistický'),
('Futuristic', 'futuristic', 'Futuristický a avantgardný'),
('Classic', 'classic', 'Klasický a elegantný'),
('Casual', 'casual', 'Voľnočasový a pohodlný'),
('Romantic', 'romantic', 'Romantický a jemný'),
('Bohemian', 'bohemian', 'Bohémsky a voľný'),
('Gothic', 'gothic', 'Gotický a temný'),
('Sporty', 'sporty', 'Športový a aktívny')
ON CONFLICT (slug) DO NOTHING;

-- Seed data pre materiály
INSERT INTO public.fashion_materials (name, slug, description) VALUES
('Hodváb', 'silk', 'Luxusný hodvábny materiál'),
('Bavlna', 'cotton', 'Prírodná bavlna'),
('Denim', 'denim', 'Pevný džínsový materiál'),
('Koža', 'leather', 'Pravá alebo umelá koža'),
('Vlna', 'wool', 'Hrejivá vlnená tkanina'),
('Ľan', 'linen', 'Ľahký ľanový materiál'),
('Saten', 'satin', 'Lesklý satén'),
('Čipka', 'lace', 'Jemná čipka'),
('Tyl', 'tulle', 'Vzdušný tylový materiál'),
('Polyester', 'polyester', 'Syntetický polyester')
ON CONFLICT (slug) DO NOTHING;