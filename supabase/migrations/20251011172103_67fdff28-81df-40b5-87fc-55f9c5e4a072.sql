-- Add gifts with category field
INSERT INTO public.platform_gifts (id, name, icon, price, category) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ruža', '🌹', 0.50, 'stream_gift'),
  ('00000000-0000-0000-0000-000000000002', 'Srdce', '❤️', 1.00, 'stream_gift'),
  ('00000000-0000-0000-0000-000000000003', 'Diamant', '💎', 5.00, 'stream_gift'),
  ('00000000-0000-0000-0000-000000000004', 'Koruna', '👑', 10.00, 'stream_gift')
ON CONFLICT (id) DO NOTHING;

-- Add columns to stream_gifts table
ALTER TABLE public.stream_gifts 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS gift_id UUID REFERENCES public.platform_gifts(id);

-- Add transaction type for stream gifts
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS stream_id UUID REFERENCES public.live_streams(id);