
-- Concert song requests table
CREATE TABLE IF NOT EXISTS concert_song_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  concert_id uuid REFERENCES live_concert_streams(id) ON DELETE SET NULL,
  song_title text NOT NULL,
  artist_name text,
  tier text NOT NULL DEFAULT 'standard',
  amount numeric NOT NULL,
  musician_amount numeric,
  platform_commission numeric,
  status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE concert_song_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own song requests"
  ON concert_song_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert song requests"
  ON concert_song_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add stripe_session_id to tables missing it for webhook matching
ALTER TABLE dating_sent_gifts ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE dating_sent_gifts ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE dating_sent_gifts ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE dating_sent_gifts ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';

ALTER TABLE stream_gifts ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE stream_gifts ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE stream_gifts ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE stream_gifts ADD COLUMN IF NOT EXISTS sender_id uuid;

ALTER TABLE sent_platform_gifts ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE sent_platform_gifts ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE sent_platform_gifts ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';

ALTER TABLE shadow_gifts ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';

ALTER TABLE influencer_tips ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE influencer_tips ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';
