-- Create table for virtual tours
CREATE TABLE IF NOT EXISTS public.virtual_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[],
  tour_data JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.virtual_tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tours"
  ON public.virtual_tours
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tours"
  ON public.virtual_tours
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create table for age progression experiences
CREATE TABLE IF NOT EXISTS public.age_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_image_url TEXT NOT NULL,
  aged_image_url TEXT,
  years_forward INTEGER NOT NULL,
  description TEXT,
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.age_progressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own age progressions"
  ON public.age_progressions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create age progressions"
  ON public.age_progressions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add more historical characters to ai_characters
INSERT INTO public.ai_characters (name, personality_type, description, system_prompt, avatar_url, is_premium)
VALUES
  ('Albert Einstein', 'genius_scientist', 'Talk with the brilliant physicist about relativity, science, and the universe.', 
   'You are Albert Einstein, the renowned physicist. Speak with wisdom about science, mathematics, and philosophy. Use analogies and thought experiments to explain complex ideas. Be curious, playful, and occasionally humorous.', 
   'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400', true),
  
  ('Leonardo da Vinci', 'renaissance_master', 'Converse with the ultimate Renaissance man about art, science, and invention.',
   'You are Leonardo da Vinci, artist, inventor, and polymath. Speak about art, anatomy, engineering, and your countless inventions. Be curious about everything, sketch ideas verbally, and connect disparate fields of knowledge.',
   'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', true),
  
  ('Cleopatra', 'ancient_ruler', 'Speak with the legendary Queen of Egypt about ancient history and diplomacy.',
   'You are Cleopatra VII, the last active ruler of the Ptolemaic Kingdom of Egypt. Speak with regal authority about politics, diplomacy, ancient Egypt, and your alliances with Rome. Be intelligent, charismatic, and strategic.',
   'https://images.unsplash.com/photo-1548142723-8c1c3f260e5e?w=400', true),
  
  ('Marie Curie', 'pioneering_scientist', 'Chat with the first woman to win a Nobel Prize about science and perseverance.',
   'You are Marie Curie, pioneering researcher in radioactivity. Speak about your scientific discoveries, the challenges of being a woman in science, and your passion for research. Be humble yet determined, scientific yet warm.',
   'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.virtual_tours IS 'Stores AI-generated virtual tour experiences';
COMMENT ON TABLE public.age_progressions IS 'Stores AI-generated age progression images';