-- Gallery items: seeded famous + user-submitted handwriting
CREATE TABLE public.handwriting_gallery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'user' CHECK (source_type IN ('seeded','user')),
  submitter_user_id UUID,
  figure_name TEXT NOT NULL,
  title TEXT,
  era TEXT,
  region TEXT,
  story TEXT,
  image_url TEXT NOT NULL,
  ai_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handwriting_gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views approved items"
  ON public.handwriting_gallery_items FOR SELECT
  USING (status = 'approved' OR auth.uid() = submitter_user_id);

CREATE POLICY "Users submit items"
  ON public.handwriting_gallery_items FOR INSERT
  WITH CHECK (auth.uid() = submitter_user_id AND source_type = 'user');

CREATE POLICY "Users edit own items"
  ON public.handwriting_gallery_items FOR UPDATE
  USING (auth.uid() = submitter_user_id);

CREATE POLICY "Users delete own items"
  ON public.handwriting_gallery_items FOR DELETE
  USING (auth.uid() = submitter_user_id);

CREATE INDEX idx_gallery_status_created ON public.handwriting_gallery_items(status, created_at DESC);
CREATE INDEX idx_gallery_likes ON public.handwriting_gallery_items(likes_count DESC);

-- Likes
CREATE TABLE public.handwriting_gallery_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.handwriting_gallery_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

ALTER TABLE public.handwriting_gallery_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views likes"
  ON public.handwriting_gallery_likes FOR SELECT
  USING (true);
CREATE POLICY "Users like items"
  ON public.handwriting_gallery_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own"
  ON public.handwriting_gallery_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Maintain like counter via trigger
CREATE OR REPLACE FUNCTION public.handwriting_gallery_like_counter()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.handwriting_gallery_items
       SET likes_count = likes_count + 1
     WHERE id = NEW.item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.handwriting_gallery_items
       SET likes_count = GREATEST(0, likes_count - 1)
     WHERE id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_gallery_like_counter
AFTER INSERT OR DELETE ON public.handwriting_gallery_likes
FOR EACH ROW EXECUTE FUNCTION public.handwriting_gallery_like_counter();

-- Tour-guide chat history
CREATE TABLE public.handwriting_gallery_tour_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.handwriting_gallery_items(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handwriting_gallery_tour_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tour chats"
  ON public.handwriting_gallery_tour_chats FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users add own tour chats"
  ON public.handwriting_gallery_tour_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Seed 8 famous figures (image URLs use Wikimedia Commons signature/handwriting samples)
INSERT INTO public.handwriting_gallery_items
  (source_type, figure_name, title, era, region, story, image_url, ai_traits, tags, status)
VALUES
  ('seeded', 'Albert Einstein', 'Theoretical Physicist',
   '1879-1955', 'Germany / USA',
   'Einstein''s flowing handwriting reveals his playful intuition and abstract thinking. The slight rightward slant and rounded loops suggest emotional warmth balanced with rigorous logic.',
   'https://upload.wikimedia.org/wikipedia/commons/a/a6/Albert_Einstein_signature_1934.svg',
   '{"creativity":92,"analytical":95,"introspection":88,"speed":74}'::jsonb,
   ARRAY['scientist','physics','genius'], 'approved'),

  ('seeded', 'Napoleon Bonaparte', 'Emperor & Military Strategist',
   '1769-1821', 'France',
   'Napoleon''s aggressive, downward-sloping signature betrays urgency, ambition and the weight of an empire. Letters compress under pressure of decision-making.',
   'https://upload.wikimedia.org/wikipedia/commons/2/22/Napoleon_signature.svg',
   '{"dominance":94,"speed":90,"impulsivity":80,"focus":82}'::jsonb,
   ARRAY['military','leader','history'], 'approved'),

  ('seeded', 'Wolfgang Amadeus Mozart', 'Composer',
   '1756-1791', 'Austria',
   'Mozart''s elegant cursive flows like his music — symmetrical loops, controlled rhythm, ornate flourishes hinting at perfectionism and joy.',
   'https://upload.wikimedia.org/wikipedia/commons/4/45/Mozart_Signature.svg',
   '{"creativity":97,"rhythm":95,"perfectionism":88,"sociability":78}'::jsonb,
   ARRAY['music','classical','composer'], 'approved'),

  ('seeded', 'Marie Curie', 'Physicist & Chemist',
   '1867-1934', 'Poland / France',
   'Curie''s small, tightly-spaced script mirrors her laser focus and humility. Even pressure lines reveal extraordinary self-discipline.',
   'https://upload.wikimedia.org/wikipedia/commons/0/00/Marie_Curie_Signature_Polish.svg',
   '{"focus":96,"persistence":94,"humility":85,"analytical":92}'::jsonb,
   ARRAY['scientist','nobel','chemistry'], 'approved'),

  ('seeded', 'Nikola Tesla', 'Inventor',
   '1856-1943', 'Serbia / USA',
   'Tesla''s sharp angular strokes and wide spacing betray a mind racing between dimensions — visionary, isolated, electric.',
   'https://upload.wikimedia.org/wikipedia/commons/4/4c/Nikola_Tesla_signature.svg',
   '{"creativity":95,"vision":98,"isolation":78,"intensity":91}'::jsonb,
   ARRAY['inventor','electricity','genius'], 'approved'),

  ('seeded', 'Leonardo da Vinci', 'Renaissance Polymath',
   '1452-1519', 'Italy',
   'Famous for mirror writing, Leonardo''s right-to-left script reflects an unconventional mind that protected its secrets — a fortress of curiosity.',
   'https://upload.wikimedia.org/wikipedia/commons/9/95/Leonardo_da_Vinci_-_signature.svg',
   '{"creativity":99,"secrecy":92,"curiosity":98,"originality":97}'::jsonb,
   ARRAY['artist','inventor','renaissance'], 'approved'),

  ('seeded', 'Pablo Picasso', 'Painter',
   '1881-1973', 'Spain / France',
   'Picasso''s signature is a painting in itself — bold strokes, dramatic flourish, unmistakable ego signed onto every canvas.',
   'https://upload.wikimedia.org/wikipedia/commons/6/64/Picasso_Signature.svg',
   '{"ego":96,"creativity":98,"drama":92,"confidence":95}'::jsonb,
   ARRAY['artist','cubism','painter'], 'approved'),

  ('seeded', 'Ernest Hemingway', 'Novelist',
   '1899-1961', 'USA',
   'Hemingway''s blocky, unpretentious script matches his prose — direct, muscular, no wasted ink.',
   'https://upload.wikimedia.org/wikipedia/commons/0/04/Ernest_Hemingway_Signature.svg',
   '{"directness":95,"strength":90,"simplicity":92,"melancholy":74}'::jsonb,
   ARRAY['writer','novelist','american'], 'approved');

-- Storage bucket for gallery user submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('handwriting-gallery', 'handwriting-gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Gallery images publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'handwriting-gallery');

CREATE POLICY "Users upload own gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'handwriting-gallery'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own gallery images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'handwriting-gallery'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );