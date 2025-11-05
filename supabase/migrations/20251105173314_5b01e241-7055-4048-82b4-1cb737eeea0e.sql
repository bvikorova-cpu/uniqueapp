-- Create voice clones table
CREATE TABLE IF NOT EXISTS public.voice_clones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  description TEXT,
  voice_id TEXT,
  sample_audio_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  elevenlabs_voice_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice generations table
CREATE TABLE IF NOT EXISTS public.voice_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voice_clone_id UUID NOT NULL REFERENCES public.voice_clones(id) ON DELETE CASCADE,
  text_content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  audio_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voice library subscriptions table
CREATE TABLE IF NOT EXISTS public.voice_library_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  voices_limit INTEGER DEFAULT 5,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation mode subscriptions table
CREATE TABLE IF NOT EXISTS public.voice_conversation_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  unlimited_generations BOOLEAN DEFAULT true,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_library_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_conversation_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_clones
CREATE POLICY "Users can view their own voice clones"
  ON public.voice_clones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice clones"
  ON public.voice_clones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice clones"
  ON public.voice_clones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice clones"
  ON public.voice_clones FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_generations
CREATE POLICY "Users can view their own generations"
  ON public.voice_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
  ON public.voice_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for voice_library_subscriptions
CREATE POLICY "Users can view their own library subscription"
  ON public.voice_library_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own library subscription"
  ON public.voice_library_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library subscription"
  ON public.voice_library_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_conversation_subscriptions
CREATE POLICY "Users can view their own conversation subscription"
  ON public.voice_conversation_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation subscription"
  ON public.voice_conversation_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation subscription"
  ON public.voice_conversation_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_voice_clone_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_voice_clones_updated_at
  BEFORE UPDATE ON public.voice_clones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_clone_updated_at();

CREATE TRIGGER update_voice_library_subscriptions_updated_at
  BEFORE UPDATE ON public.voice_library_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_clone_updated_at();

CREATE TRIGGER update_voice_conversation_subscriptions_updated_at
  BEFORE UPDATE ON public.voice_conversation_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_voice_clone_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_clones_user_id ON public.voice_clones(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_clones_status ON public.voice_clones(status);
CREATE INDEX IF NOT EXISTS idx_voice_generations_user_id ON public.voice_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_generations_voice_clone_id ON public.voice_generations(voice_clone_id);
CREATE INDEX IF NOT EXISTS idx_voice_library_subscriptions_user_id ON public.voice_library_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_conversation_subscriptions_user_id ON public.voice_conversation_subscriptions(user_id);