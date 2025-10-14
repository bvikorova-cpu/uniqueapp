-- Create enums for astrology
CREATE TYPE zodiac_sign AS ENUM (
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
);

CREATE TYPE tarot_card_position AS ENUM ('past', 'present', 'future', 'outcome');
CREATE TYPE reading_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'love', 'career', 'general');

-- Birth charts table
CREATE TABLE birth_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_place TEXT NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  sun_sign zodiac_sign NOT NULL,
  moon_sign zodiac_sign,
  rising_sign zodiac_sign,
  chart_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily horoscopes
CREATE TABLE daily_horoscopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zodiac_sign zodiac_sign NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  lucky_numbers INTEGER[],
  lucky_colors TEXT[],
  compatibility_signs zodiac_sign[],
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  love_score INTEGER CHECK (love_score >= 1 AND love_score <= 10),
  career_score INTEGER CHECK (career_score >= 1 AND career_score <= 10),
  health_score INTEGER CHECK (health_score >= 1 AND health_score <= 10),
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Compatibility readings
CREATE TABLE compatibility_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sign1 zodiac_sign NOT NULL,
  sign2 zodiac_sign NOT NULL,
  compatibility_score INTEGER CHECK (compatibility_score >= 1 AND compatibility_score <= 100),
  analysis TEXT NOT NULL,
  strengths TEXT[],
  challenges TEXT[],
  advice TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tarot readings
CREATE TABLE tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT,
  cards JSONB NOT NULL,
  interpretation TEXT NOT NULL,
  reading_type reading_type DEFAULT 'general',
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Numerology readings
CREATE TABLE numerology_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  life_path_number INTEGER,
  destiny_number INTEGER,
  soul_urge_number INTEGER,
  personality_number INTEGER,
  interpretation TEXT NOT NULL,
  lucky_numbers INTEGER[],
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Premium astro subscriptions
CREATE TABLE astro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'vip')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE birth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_horoscopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE numerology_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE astro_subscriptions ENABLE ROW LEVEL SECURITY;

-- Birth charts policies
CREATE POLICY "Users can view their own birth charts"
  ON birth_charts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own birth charts"
  ON birth_charts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birth charts"
  ON birth_charts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own birth charts"
  ON birth_charts FOR DELETE
  USING (auth.uid() = user_id);

-- Daily horoscopes policies
CREATE POLICY "Users can view their own horoscopes"
  ON daily_horoscopes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create horoscopes"
  ON daily_horoscopes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Compatibility readings policies
CREATE POLICY "Users can view their compatibility readings"
  ON compatibility_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create compatibility readings"
  ON compatibility_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tarot readings policies
CREATE POLICY "Users can view their tarot readings"
  ON tarot_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tarot readings"
  ON tarot_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Numerology readings policies
CREATE POLICY "Users can view their numerology readings"
  ON numerology_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create numerology readings"
  ON numerology_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Astro subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON astro_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their subscriptions"
  ON astro_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions"
  ON astro_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_birth_charts_user_id ON birth_charts(user_id);
CREATE INDEX idx_daily_horoscopes_user_date ON daily_horoscopes(user_id, date);
CREATE INDEX idx_compatibility_readings_user_id ON compatibility_readings(user_id);
CREATE INDEX idx_tarot_readings_user_id ON tarot_readings(user_id);
CREATE INDEX idx_numerology_readings_user_id ON numerology_readings(user_id);
CREATE INDEX idx_astro_subscriptions_user_id ON astro_subscriptions(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_birth_charts_updated_at
  BEFORE UPDATE ON birth_charts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_astro_subscriptions_updated_at
  BEFORE UPDATE ON astro_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();