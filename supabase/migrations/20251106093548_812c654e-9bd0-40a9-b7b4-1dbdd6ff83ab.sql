-- Create skill matches table to store potential matches
CREATE TABLE IF NOT EXISTS skill_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matching_skills TEXT[] NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

-- Enable RLS
ALTER TABLE skill_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill matches
CREATE POLICY "Users can view their own matches"
  ON skill_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON skill_matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert matches"
  ON skill_matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own matches"
  ON skill_matches FOR DELETE
  USING (auth.uid() = user_id);

-- Function to find skill matches for a user
CREATE OR REPLACE FUNCTION find_skill_matches(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_skills_offered TEXT[];
  v_user_skills_wanted TEXT[];
  v_match_record RECORD;
BEGIN
  -- Get user's skills
  SELECT skills_offered, skills_wanted
  INTO v_user_skills_offered, v_user_skills_wanted
  FROM profiles
  WHERE id = p_user_id;

  -- Skip if user has no skills defined
  IF v_user_skills_offered IS NULL OR v_user_skills_wanted IS NULL THEN
    RETURN;
  END IF;

  -- Delete old matches for this user
  DELETE FROM skill_matches WHERE user_id = p_user_id;

  -- Find potential matches
  FOR v_match_record IN
    SELECT 
      p.id as matched_user_id,
      p.skills_offered,
      p.skills_wanted,
      -- Calculate matching skills (what user wants that other offers)
      array(
        SELECT unnest(v_user_skills_wanted)
        INTERSECT
        SELECT unnest(p.skills_offered)
      ) as user_wanted_match,
      -- Calculate matching skills (what other wants that user offers)
      array(
        SELECT unnest(p.skills_wanted)
        INTERSECT
        SELECT unnest(v_user_skills_offered)
      ) as other_wanted_match
    FROM profiles p
    WHERE p.id != p_user_id
      AND p.skills_offered IS NOT NULL
      AND p.skills_wanted IS NOT NULL
      AND (
        -- User wants what other offers
        EXISTS (
          SELECT 1 FROM unnest(v_user_skills_wanted) skill
          WHERE skill = ANY(p.skills_offered)
        )
        OR
        -- Other wants what user offers
        EXISTS (
          SELECT 1 FROM unnest(p.skills_wanted) skill
          WHERE skill = ANY(v_user_skills_offered)
        )
      )
  LOOP
    -- Calculate match score and combine matching skills
    DECLARE
      v_all_matches TEXT[];
      v_match_score INTEGER;
    BEGIN
      v_all_matches := array_cat(v_match_record.user_wanted_match, v_match_record.other_wanted_match);
      v_match_score := array_length(v_all_matches, 1);
      
      -- Only insert if there are matches
      IF v_match_score > 0 THEN
        INSERT INTO skill_matches (
          user_id,
          matched_user_id,
          matching_skills,
          match_score
        ) VALUES (
          p_user_id,
          v_match_record.matched_user_id,
          v_all_matches,
          v_match_score
        )
        ON CONFLICT (user_id, matched_user_id) 
        DO UPDATE SET
          matching_skills = EXCLUDED.matching_skills,
          match_score = EXCLUDED.match_score,
          updated_at = now();
      END IF;
    END;
  END LOOP;
END;
$$;

-- Trigger to find matches when profile is updated
CREATE OR REPLACE FUNCTION trigger_find_skill_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only recalculate if skills changed
  IF (OLD.skills_offered IS DISTINCT FROM NEW.skills_offered) 
     OR (OLD.skills_wanted IS DISTINCT FROM NEW.skills_wanted) THEN
    PERFORM find_skill_matches(NEW.id);
    
    -- Also update matches for users who might match with this user
    PERFORM find_skill_matches(p.id)
    FROM profiles p
    WHERE p.id != NEW.id
      AND (
        p.skills_offered && NEW.skills_wanted
        OR p.skills_wanted && NEW.skills_offered
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS update_skill_matches ON profiles;
CREATE TRIGGER update_skill_matches
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_find_skill_matches();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skill_matches_user ON skill_matches(user_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_skill_matches_status ON skill_matches(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills_offered, skills_wanted);