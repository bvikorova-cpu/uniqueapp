-- Stock Content Library Tables

-- Table for stock content items (images, videos, etc.)
CREATE TABLE IF NOT EXISTS stock_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'audio', 'document', '3d_model')),
  file_url TEXT NOT NULL,
  preview_url TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  price_eur DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  license_type TEXT NOT NULL DEFAULT 'standard',
  file_size_mb DECIMAL(10,2),
  resolution TEXT,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  total_downloads INTEGER DEFAULT 0,
  total_revenue_eur DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for content downloads/purchases
CREATE TABLE IF NOT EXISTS stock_content_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES stock_content_items(id) ON DELETE CASCADE,
  buyer_id UUID,
  buyer_email TEXT,
  price_paid_eur DECIMAL(10,2) NOT NULL,
  platform_fee_eur DECIMAL(10,2) NOT NULL,
  creator_earning_eur DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  download_url TEXT,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for creator earnings summary
CREATE TABLE IF NOT EXISTS stock_content_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  month_year TEXT NOT NULL,
  total_downloads INTEGER DEFAULT 0,
  total_revenue_eur DECIMAL(10,2) DEFAULT 0,
  platform_fees_eur DECIMAL(10,2) DEFAULT 0,
  net_earnings_eur DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, month_year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_content_creator ON stock_content_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_stock_content_category ON stock_content_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_content_active ON stock_content_items(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_downloads_content ON stock_content_downloads(content_id);
CREATE INDEX IF NOT EXISTS idx_stock_downloads_buyer ON stock_content_downloads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_stock_earnings_creator ON stock_content_earnings(creator_id);

-- RLS Policies for stock_content_items
ALTER TABLE stock_content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active stock content"
  ON stock_content_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Creators can insert their own content"
  ON stock_content_items FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own content"
  ON stock_content_items FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own content"
  ON stock_content_items FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for stock_content_downloads
ALTER TABLE stock_content_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
  ON stock_content_downloads FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Creators can view downloads of their content"
  ON stock_content_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stock_content_items
      WHERE stock_content_items.id = stock_content_downloads.content_id
      AND stock_content_items.creator_id = auth.uid()
    )
  );

-- RLS Policies for stock_content_earnings
ALTER TABLE stock_content_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own earnings"
  ON stock_content_earnings FOR SELECT
  USING (auth.uid() = creator_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_stock_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_stock_content_items_timestamp
  BEFORE UPDATE ON stock_content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_content_timestamp();

CREATE TRIGGER update_stock_earnings_timestamp
  BEFORE UPDATE ON stock_content_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_content_timestamp();