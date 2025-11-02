-- Memory Theft Social Network Tables

-- Table for storing individual memories
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL, -- {text: string, audio_url?: string, visual_urls?: string[]}
  category TEXT NOT NULL, -- 'adventure', 'love', 'achievement', 'travel', 'other'
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_requested BOOLEAN DEFAULT FALSE,
  times_stolen INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for memory purchases/steals
CREATE TABLE public.memory_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  rating INTEGER, -- 1-5 stars
  review TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for memory collections
CREATE TABLE public.memory_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  memory_ids UUID[] NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 29.99,
  cover_image_url TEXT,
  times_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for collection purchases
CREATE TABLE public.memory_collection_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.memory_collections(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for memory auctions
CREATE TABLE public.memory_auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  starting_price DECIMAL(10,2) NOT NULL,
  current_bid DECIMAL(10,2),
  highest_bidder_id UUID,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for auction bids
CREATE TABLE public.memory_auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.memory_auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  bid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for memory verification requests
CREATE TABLE public.memory_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  verification_cost DECIMAL(10,2) NOT NULL DEFAULT 0.99,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_collection_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for memories
CREATE POLICY "Memories are viewable by everyone"
  ON public.memories FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for memory_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.memory_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases"
  ON public.memory_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their purchase reviews"
  ON public.memory_purchases FOR UPDATE
  USING (auth.uid() = buyer_id);

-- RLS Policies for memory_collections
CREATE POLICY "Collections are viewable by everyone"
  ON public.memory_collections FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own collections"
  ON public.memory_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.memory_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.memory_collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for memory_collection_purchases
CREATE POLICY "Users can view their own collection purchases"
  ON public.memory_collection_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create collection purchases"
  ON public.memory_collection_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for memory_auctions
CREATE POLICY "Auctions are viewable by everyone"
  ON public.memory_auctions FOR SELECT
  USING (true);

CREATE POLICY "Users can create auctions for their memories"
  ON public.memory_auctions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_auctions.memory_id
      AND memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Memory owners can update their auctions"
  ON public.memory_auctions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memories
      WHERE memories.id = memory_auctions.memory_id
      AND memories.user_id = auth.uid()
    )
  );

-- RLS Policies for memory_auction_bids
CREATE POLICY "Bids are viewable by everyone"
  ON public.memory_auction_bids FOR SELECT
  USING (true);

CREATE POLICY "Users can create bids"
  ON public.memory_auction_bids FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- RLS Policies for memory_verifications
CREATE POLICY "Users can view their verification requests"
  ON public.memory_verifications FOR SELECT
  USING (auth.uid() = requested_by);

CREATE POLICY "Users can request verification"
  ON public.memory_verifications FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

-- Indexes for performance
CREATE INDEX idx_memories_user_id ON public.memories(user_id);
CREATE INDEX idx_memories_category ON public.memories(category);
CREATE INDEX idx_memories_price ON public.memories(price);
CREATE INDEX idx_memory_purchases_buyer_id ON public.memory_purchases(buyer_id);
CREATE INDEX idx_memory_purchases_memory_id ON public.memory_purchases(memory_id);
CREATE INDEX idx_memory_collections_user_id ON public.memory_collections(user_id);
CREATE INDEX idx_memory_auctions_status ON public.memory_auctions(status);
CREATE INDEX idx_memory_auctions_ends_at ON public.memory_auctions(ends_at);
CREATE INDEX idx_memory_auction_bids_auction_id ON public.memory_auction_bids(auction_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_memories_timestamp
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_timestamp();

CREATE TRIGGER update_memory_collections_timestamp
  BEFORE UPDATE ON public.memory_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_timestamp();

CREATE TRIGGER update_memory_auctions_timestamp
  BEFORE UPDATE ON public.memory_auctions
  FOR EACH ROW
  EXECUTE FUNCTION update_memory_timestamp();