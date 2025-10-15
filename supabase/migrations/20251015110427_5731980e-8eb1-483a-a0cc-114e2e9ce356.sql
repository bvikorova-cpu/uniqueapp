-- Remove incorrectly placed trigger from talent_submissions
-- This trigger was designed for talent_votes table, not talent_submissions
DROP TRIGGER IF EXISTS add_bonus_votes_on_submission ON talent_submissions;