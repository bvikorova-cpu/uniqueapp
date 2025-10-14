-- Create enum for clothing categories
CREATE TYPE clothing_category AS ENUM (
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'shoes',
  'accessories',
  'bags'
);

-- Create enum for occasions
CREATE TYPE occasion_type AS ENUM (
  'casual',
  'work',
  'formal',
  'party',
  'sports',
  'date',
  'travel'
);

-- Create enum for seasons
CREATE TYPE season_type AS ENUM (
  'spring',
  'summer',
  'fall',
  'winter',
  'all_season'
);

-- Wardrobe items table
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category clothing_category NOT NULL,
  color TEXT NOT NULL,
  brand TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  season season_type DEFAULT 'all_season',
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outfit recommendations table
CREATE TABLE IF NOT EXISTS public.outfit_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  occasion occasion_type NOT NULL,
  season season_type NOT NULL,
  ai_description TEXT NOT NULL,
  item_ids UUID[] NOT NULL,
  styling_tips TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Styling sessions table (for premium)
CREATE TABLE IF NOT EXISTS public.styling_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL,
  occasion TEXT,
  preferences JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  credits_used INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Virtual try-on history
CREATE TABLE IF NOT EXISTS public.virtual_tryon_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_photo_url TEXT NOT NULL,
  item_id UUID,
  tryon_result_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shopping wishlist
CREATE TABLE IF NOT EXISTS public.shopping_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  category clothing_category,
  price_range TEXT,
  preferred_brands TEXT[],
  affiliate_link TEXT,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_tryon_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wardrobe_items
CREATE POLICY "Users can view their own wardrobe items"
  ON public.wardrobe_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wardrobe items"
  ON public.wardrobe_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
  ON public.wardrobe_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
  ON public.wardrobe_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for outfit_recommendations
CREATE POLICY "Users can view their own outfit recommendations"
  ON public.outfit_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit recommendations"
  ON public.outfit_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit recommendations"
  ON public.outfit_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit recommendations"
  ON public.outfit_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for styling_sessions
CREATE POLICY "Users can view their own styling sessions"
  ON public.styling_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own styling sessions"
  ON public.styling_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own styling sessions"
  ON public.styling_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for virtual_tryon_history
CREATE POLICY "Users can view their own try-on history"
  ON public.virtual_tryon_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own try-on history"
  ON public.virtual_tryon_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for shopping_wishlist
CREATE POLICY "Users can view their own wishlist"
  ON public.shopping_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist items"
  ON public.shopping_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON public.shopping_wishlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
  ON public.shopping_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON public.wardrobe_items(category);
CREATE INDEX idx_outfit_recommendations_user_id ON public.outfit_recommendations(user_id);
CREATE INDEX idx_styling_sessions_user_id ON public.styling_sessions(user_id);
CREATE INDEX idx_virtual_tryon_history_user_id ON public.virtual_tryon_history(user_id);
CREATE INDEX idx_shopping_wishlist_user_id ON public.shopping_wishlist(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_wardrobe_items_updated_at
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();