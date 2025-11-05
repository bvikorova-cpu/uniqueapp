-- Create home_decor_items table
CREATE TABLE IF NOT EXISTS public.home_decor_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_decor_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view home decor items"
  ON public.home_decor_items
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own home decor items"
  ON public.home_decor_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own home decor items"
  ON public.home_decor_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own home decor items"
  ON public.home_decor_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_home_decor_items_updated_at
  BEFORE UPDATE ON public.home_decor_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create home_decor_messages table for buyer-seller communication
CREATE TABLE IF NOT EXISTS public.home_decor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.home_decor_items(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.home_decor_messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS Policies
CREATE POLICY "Users can view messages they sent or received"
  ON public.home_decor_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages"
  ON public.home_decor_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their received messages as read"
  ON public.home_decor_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create storage bucket for home decor images
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-decor-items', 'home-decor-items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for home-decor-items bucket
CREATE POLICY "Anyone can view home decor item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'home-decor-items');

CREATE POLICY "Authenticated users can upload home decor images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'home-decor-items' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own home decor images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'home-decor-items'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own home decor images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'home-decor-items'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );