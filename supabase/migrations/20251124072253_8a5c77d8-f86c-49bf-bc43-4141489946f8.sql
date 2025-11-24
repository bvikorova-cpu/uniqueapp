-- ============================================
-- CORE TEST DATA
-- ============================================

-- Posts for Wall
INSERT INTO posts (user_id, content, created_at) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Welcome to our platform! 🎉 Testing the feed functionality.', NOW() - INTERVAL '1 hour'),
((SELECT id FROM auth.users LIMIT 1), 'Interesting content about technology and innovation.', NOW() - INTERVAL '2 hours'),
((SELECT id FROM auth.users LIMIT 1), 'Another test post with emojis 🚀 🌟 ✨', NOW() - INTERVAL '3 hours'),
((SELECT id FROM auth.users LIMIT 1), 'Latest tech trends in 2025', NOW() - INTERVAL '5 hours'),
((SELECT id FROM auth.users LIMIT 1), 'Just finished an amazing project! 💪', NOW() - INTERVAL '8 hours');

-- Events for Wall
INSERT INTO events (creator_id, title, description, location, start_time, end_time, created_at) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Community Meetup', 'Exciting community meetup to discuss new features!', 'Online - Zoom', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 2 hours', NOW()),
((SELECT id FROM auth.users LIMIT 1), 'Tech Conference 2025', 'Annual technology conference', 'Convention Center', NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days 8 hours', NOW()),
((SELECT id FROM auth.users LIMIT 1), 'Networking Event', 'Connect with professionals', 'Coffee House', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days 3 hours', NOW()),
((SELECT id FROM auth.users LIMIT 1), 'Web Dev Workshop', 'Learn latest web development techniques', 'Online', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days 4 hours', NOW());

-- Activity Logs for Rewards
INSERT INTO activity_logs (user_id, activity_type, points_earned, created_at) VALUES
((SELECT id FROM auth.users LIMIT 1), 'post_created', 10, NOW() - INTERVAL '1 day'),
((SELECT id FROM auth.users LIMIT 1), 'comment_added', 5, NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users LIMIT 1), 'daily_login', 15, NOW() - INTERVAL '3 days'),
((SELECT id FROM auth.users LIMIT 1), 'post_liked', 2, NOW() - INTERVAL '4 days'),
((SELECT id FROM auth.users LIMIT 1), 'friend_added', 20, NOW() - INTERVAL '5 days'),
((SELECT id FROM auth.users LIMIT 1), 'video_uploaded', 25, NOW() - INTERVAL '6 days'),
((SELECT id FROM auth.users LIMIT 1), 'game_played', 8, NOW() - INTERVAL '7 days'),
((SELECT id FROM auth.users LIMIT 1), 'talent_submitted', 30, NOW() - INTERVAL '8 days');

-- Talent Submissions for Megatalent
INSERT INTO talent_submissions (user_id, category, title, description, media_url, media_type, votes_count, is_active, created_at) VALUES
((SELECT id FROM auth.users LIMIT 1), 'drawing', 'Beautiful Landscape', 'Peaceful landscape drawing', 'https://picsum.photos/800/600?random=1', 'image', 15, true, NOW() - INTERVAL '1 day'),
((SELECT id FROM auth.users LIMIT 1), 'singing', 'Cover Song', 'My rendition of a popular song', 'https://picsum.photos/800/600?random=2', 'video', 23, true, NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users LIMIT 1), 'dance', 'Contemporary Dance', 'Expressive contemporary performance', 'https://picsum.photos/800/600?random=3', 'video', 31, true, NOW() - INTERVAL '3 days'),
((SELECT id FROM auth.users LIMIT 1), 'photography', 'Street Photography', 'Life in the city streets', 'https://picsum.photos/800/600?random=4', 'image', 18, true, NOW() - INTERVAL '4 days'),
((SELECT id FROM auth.users LIMIT 1), 'cooking', 'Gourmet Dish', 'Cooking demonstration', 'https://picsum.photos/800/600?random=5', 'video', 12, true, NOW() - INTERVAL '5 days'),
((SELECT id FROM auth.users LIMIT 1), 'digital_art', '3D Character', 'Original 3D character', 'https://picsum.photos/800/600?random=6', 'image', 27, true, NOW() - INTERVAL '6 days'),
((SELECT id FROM auth.users LIMIT 1), 'makeup_art', 'Fantasy Makeup', 'Creative fantasy look', 'https://picsum.photos/800/600?random=7', 'video', 19, true, NOW() - INTERVAL '7 days');

-- Success notification
DO $$ 
BEGIN 
  RAISE NOTICE '✅ TEST DATA CREATED!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 5 Posts - Test /wall feed';
  RAISE NOTICE '📅 4 Events - Test /wall/events';
  RAISE NOTICE '🏆 8 Activities (115 pts) - Test /rewards';
  RAISE NOTICE '🎭 7 Submissions - Test /megatalent';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for testing! 🚀';
END $$;