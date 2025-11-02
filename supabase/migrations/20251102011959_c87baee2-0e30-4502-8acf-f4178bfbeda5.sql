-- Quantum Social Network Tables

-- Table for quantum profiles
CREATE TABLE public.quantum_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quantum_mode TEXT NOT NULL DEFAULT 'single', -- 'single', 'triple', 'unlimited'
  reality_versions INTEGER NOT NULL DEFAULT 1,
  observer_mode_active BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for quantum posts
CREATE TABLE public.quantum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  base_content TEXT NOT NULL,
  is_collapsed BOOLEAN DEFAULT FALSE,
  collapse_paid BOOLEAN DEFAULT FALSE,
  versions_count INTEGER NOT NULL DEFAULT 1,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for quantum post versions
CREATE TABLE public.quantum_post_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.quantum_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  personality_tone TEXT NOT NULL, -- 'professional', 'casual', 'humorous', 'inspirational'
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking which version each observer sees
CREATE TABLE public.quantum_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.quantum_posts(id) ON DELETE CASCADE,
  observer_id UUID NOT NULL,
  version_id UUID NOT NULL REFERENCES public.quantum_post_versions(id) ON DELETE CASCADE,
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, observer_id)
);

-- Table for quantum subscriptions
CREATE TABLE public.quantum_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL, -- 'quantum_profiles', 'observer_mode', 'quantum_entanglement'
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for quantum entanglements (connections)
CREATE TABLE public.quantum_entanglements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID NOT NULL,
  user_id_2 UUID NOT NULL,
  entanglement_strength DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
  shared_reality BOOLEAN DEFAULT TRUE,
  price_paid DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  CHECK (user_id_1 < user_id_2)
);

-- Table for reality collapse payments
CREATE TABLE public.quantum_collapses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.quantum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL DEFAULT 2.99,
  collapsed_version_id UUID NOT NULL REFERENCES public.quantum_post_versions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for quantum likes (can be different per version)
CREATE TABLE public.quantum_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.quantum_posts(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.quantum_post_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.quantum_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_entanglements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_collapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quantum_profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.quantum_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.quantum_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.quantum_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quantum_posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.quantum_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.quantum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.quantum_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.quantum_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for quantum_post_versions
CREATE POLICY "Versions are viewable by everyone"
  ON public.quantum_post_versions FOR SELECT
  USING (true);

CREATE POLICY "Post owners can create versions"
  ON public.quantum_post_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quantum_posts
      WHERE quantum_posts.id = post_id
      AND quantum_posts.user_id = auth.uid()
    )
  );

-- RLS Policies for quantum_observations
CREATE POLICY "Users can view their own observations"
  ON public.quantum_observations FOR SELECT
  USING (auth.uid() = observer_id);

CREATE POLICY "System can create observations"
  ON public.quantum_observations FOR INSERT
  WITH CHECK (auth.uid() = observer_id);

-- RLS Policies for quantum_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.quantum_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON public.quantum_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quantum_entanglements
CREATE POLICY "Entanglements are viewable by participants"
  ON public.quantum_entanglements FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create entanglements"
  ON public.quantum_entanglements FOR INSERT
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- RLS Policies for quantum_collapses
CREATE POLICY "Users can view their collapse payments"
  ON public.quantum_collapses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create collapse payments"
  ON public.quantum_collapses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quantum_likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.quantum_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create likes"
  ON public.quantum_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.quantum_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_quantum_profiles_user_id ON public.quantum_profiles(user_id);
CREATE INDEX idx_quantum_posts_user_id ON public.quantum_posts(user_id);
CREATE INDEX idx_quantum_posts_created_at ON public.quantum_posts(created_at);
CREATE INDEX idx_quantum_post_versions_post_id ON public.quantum_post_versions(post_id);
CREATE INDEX idx_quantum_observations_observer_id ON public.quantum_observations(observer_id);
CREATE INDEX idx_quantum_observations_post_id ON public.quantum_observations(post_id);
CREATE INDEX idx_quantum_entanglements_users ON public.quantum_entanglements(user_id_1, user_id_2);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quantum_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_quantum_profiles_timestamp
  BEFORE UPDATE ON public.quantum_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_quantum_timestamp();

CREATE TRIGGER update_quantum_posts_timestamp
  BEFORE UPDATE ON public.quantum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_quantum_timestamp();