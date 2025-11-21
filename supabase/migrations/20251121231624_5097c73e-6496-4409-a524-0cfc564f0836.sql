-- Add streaming columns to shadow_battle_participants
ALTER TABLE shadow_battle_participants 
ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stream_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stream_ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stream_viewers_count INTEGER DEFAULT 0;

-- Create index for active streams
CREATE INDEX IF NOT EXISTS idx_shadow_battle_participants_streaming 
ON shadow_battle_participants(battle_id, is_streaming) 
WHERE is_streaming = true;
