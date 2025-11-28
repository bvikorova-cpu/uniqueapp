-- Update safety_stories to auto-approve new stories (for demo purposes)
-- In production, you may want manual moderation
ALTER TABLE public.safety_stories ALTER COLUMN is_approved SET DEFAULT true;

-- Update safety_support_wall to auto-approve new messages
ALTER TABLE public.safety_support_wall ALTER COLUMN is_approved SET DEFAULT true;

-- Create function to auto-award badges based on activity
CREATE OR REPLACE FUNCTION public.check_and_award_safety_badges()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_courses_count INT;
    v_stories_count INT;
    v_supports_count INT;
    v_journal_count INT;
    v_wall_count INT;
    v_badges_count INT;
BEGIN
    -- Get user_id from the triggering table
    v_user_id := NEW.user_id;
    
    -- Count completions for each category
    SELECT COUNT(*) INTO v_courses_count FROM safety_course_progress WHERE user_id = v_user_id AND completed = true;
    SELECT COUNT(*) INTO v_stories_count FROM safety_stories WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_supports_count FROM safety_story_supports WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_journal_count FROM safety_journal_entries WHERE user_id = v_user_id;
    SELECT COUNT(*) INTO v_wall_count FROM safety_support_wall WHERE user_id = v_user_id;
    
    -- Award First Steps badge (1 course lesson)
    IF v_courses_count >= 1 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'first-steps') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award Safety Scholar badge (6 lessons = all courses)
    IF v_courses_count >= 6 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'safety-scholar') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award Brave Writer badge (1 story)
    IF v_stories_count >= 1 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'brave-writer') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award Kind Supporter badge (5 supports)
    IF v_supports_count >= 5 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'supporter') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award Journal Keeper badge (10 entries)
    IF v_journal_count >= 10 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'journal-keeper') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Award Encourager badge (10 wall posts)
    IF v_wall_count >= 10 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'encourager') ON CONFLICT DO NOTHING;
    END IF;
    
    -- Count earned badges for Champion badge
    SELECT COUNT(*) INTO v_badges_count FROM safety_badges_earned WHERE user_id = v_user_id;
    IF v_badges_count >= 6 THEN
        INSERT INTO safety_badges_earned (user_id, badge_id) VALUES (v_user_id, 'champion') ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for badge checking
DROP TRIGGER IF EXISTS check_badges_on_course_progress ON safety_course_progress;
CREATE TRIGGER check_badges_on_course_progress
    AFTER INSERT OR UPDATE ON safety_course_progress
    FOR EACH ROW EXECUTE FUNCTION check_and_award_safety_badges();

DROP TRIGGER IF EXISTS check_badges_on_story ON safety_stories;
CREATE TRIGGER check_badges_on_story
    AFTER INSERT ON safety_stories
    FOR EACH ROW EXECUTE FUNCTION check_and_award_safety_badges();

DROP TRIGGER IF EXISTS check_badges_on_support ON safety_story_supports;
CREATE TRIGGER check_badges_on_support
    AFTER INSERT ON safety_story_supports
    FOR EACH ROW EXECUTE FUNCTION check_and_award_safety_badges();

DROP TRIGGER IF EXISTS check_badges_on_journal ON safety_journal_entries;
CREATE TRIGGER check_badges_on_journal
    AFTER INSERT ON safety_journal_entries
    FOR EACH ROW EXECUTE FUNCTION check_and_award_safety_badges();

DROP TRIGGER IF EXISTS check_badges_on_wall ON safety_support_wall;
CREATE TRIGGER check_badges_on_wall
    AFTER INSERT ON safety_support_wall
    FOR EACH ROW EXECUTE FUNCTION check_and_award_safety_badges();