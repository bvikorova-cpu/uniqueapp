-- Trigger types regeneration by adding a comment to an existing table
COMMENT ON TABLE live_lesson_participants IS 'Participants in live lesson sessions';
COMMENT ON TABLE live_lessons IS 'Live lesson scheduling and management';
COMMENT ON TABLE discussion_replies IS 'Replies to course discussions';
COMMENT ON TABLE whiteboard_strokes IS 'Whiteboard drawing strokes for live lessons';
COMMENT ON TABLE instructor_profiles IS 'Extended profiles for course instructors';