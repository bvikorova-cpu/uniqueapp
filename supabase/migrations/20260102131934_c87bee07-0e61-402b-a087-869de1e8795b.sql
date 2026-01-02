-- Insert ~150 new badges with 100+ level requirements
-- Categories: Posts, Comments, Likes, Friends, Streak, Videos, Shares, Events, Groups, Achievements

-- POSTS badges (levels 100-10000)
INSERT INTO badges (name, description, icon, points_reward, requirement_type, requirement_value) VALUES
('Post Warrior', 'Created 100 posts', '🗡️', 300, 'posts', 100),
('Post Master', 'Created 200 posts', '⚔️', 500, 'posts', 200),
('Post Legend', 'Created 500 posts', '🏅', 1000, 'posts', 500),
('Post Titan', 'Created 1000 posts', '🔱', 2000, 'posts', 1000),
('Post God', 'Created 2000 posts', '👑', 4000, 'posts', 2000),
('Post Overlord', 'Created 3000 posts', '💎', 6000, 'posts', 3000),
('Post Emperor', 'Created 5000 posts', '🌟', 10000, 'posts', 5000),
('Post Deity', 'Created 7500 posts', '✨', 15000, 'posts', 7500),
('Post Immortal', 'Created 10000 posts', '🏛️', 20000, 'posts', 10000),

-- COMMENTS badges (levels 100-10000)
('Comment Master', 'Wrote 100 comments', '📝', 200, 'comments', 100),
('Comment Wizard', 'Wrote 200 comments', '🪄', 400, 'comments', 200),
('Comment Sage', 'Wrote 500 comments', '📚', 800, 'comments', 500),
('Comment Legend', 'Wrote 1000 comments', '🎓', 1500, 'comments', 1000),
('Comment Titan', 'Wrote 2000 comments', '🏆', 3000, 'comments', 2000),
('Comment God', 'Wrote 5000 comments', '👑', 6000, 'comments', 5000),
('Comment Immortal', 'Wrote 10000 comments', '💫', 12000, 'comments', 10000),

-- LIKES RECEIVED badges (levels 100-100000)
('Love Magnet', 'Received 200 likes', '💕', 200, 'likes_received', 200),
('Heart Collector', 'Received 500 likes', '💗', 400, 'likes_received', 500),
('Love Master', 'Received 1000 likes', '💖', 800, 'likes_received', 1000),
('Heart Legend', 'Received 2000 likes', '💝', 1500, 'likes_received', 2000),
('Love Titan', 'Received 5000 likes', '💞', 3000, 'likes_received', 5000),
('Heart God', 'Received 10000 likes', '💘', 6000, 'likes_received', 10000),
('Love Emperor', 'Received 25000 likes', '💜', 12000, 'likes_received', 25000),
('Heart Immortal', 'Received 50000 likes', '🩷', 20000, 'likes_received', 50000),
('Love Deity', 'Received 100000 likes', '❣️', 40000, 'likes_received', 100000),

-- FRIENDS badges (levels 100-5000)
('Social Butterfly', 'Have 100 friends', '🦋', 300, 'friends', 100),
('Social Star', 'Have 200 friends', '⭐', 500, 'friends', 200),
('Connection King', 'Have 500 friends', '👑', 1000, 'friends', 500),
('Network Master', 'Have 1000 friends', '🌐', 2000, 'friends', 1000),
('Social Legend', 'Have 2000 friends', '🏛️', 4000, 'friends', 2000),
('Friend God', 'Have 5000 friends', '✨', 8000, 'friends', 5000),

-- LOGIN STREAK badges (levels 100-365)
('Streak Warrior', '100-day login streak', '⚡', 2000, 'login_streak', 100),
('Streak Master', '150-day login streak', '🔥', 3500, 'login_streak', 150),
('Streak Legend', '200-day login streak', '💥', 5000, 'login_streak', 200),
('Yearly Warrior', '365-day login streak', '🎊', 10000, 'login_streak', 365),

-- VIDEO badges (levels 100-5000)
('Video Pro', 'Shared 100 videos', '🎬', 400, 'videos', 100),
('Video Star', 'Shared 200 videos', '🌟', 700, 'videos', 200),
('Video Master', 'Shared 500 videos', '📹', 1500, 'videos', 500),
('Video Legend', 'Shared 1000 videos', '🎥', 3000, 'videos', 1000),
('Video Titan', 'Shared 2000 videos', '🎞️', 5000, 'videos', 2000),
('Video God', 'Shared 5000 videos', '🎭', 10000, 'videos', 5000),

-- SHARE badges (levels 100-10000)
('Share Starter', 'Shared content 100 times', '🔗', 200, 'shares', 100),
('Share Pro', 'Shared content 200 times', '📤', 400, 'shares', 200),
('Share Master', 'Shared content 500 times', '📢', 800, 'shares', 500),
('Share Legend', 'Shared content 1000 times', '📣', 1500, 'shares', 1000),
('Share Titan', 'Shared content 2500 times', '🔊', 3000, 'shares', 2500),
('Share God', 'Shared content 5000 times', '📡', 6000, 'shares', 5000),
('Share Immortal', 'Shared content 10000 times', '🌍', 12000, 'shares', 10000),

-- EVENT badges (levels 100-5000)
('Event Goer', 'Attended 100 events', '🎉', 500, 'events', 100),
('Event Enthusiast', 'Attended 200 events', '🎊', 900, 'events', 200),
('Event Master', 'Attended 500 events', '🎪', 2000, 'events', 500),
('Event Legend', 'Attended 1000 events', '🏟️', 4000, 'events', 1000),
('Event Titan', 'Attended 2000 events', '🎭', 7000, 'events', 2000),
('Event God', 'Attended 5000 events', '🌟', 15000, 'events', 5000),

-- GROUP badges (levels 100-2000)
('Group Leader', 'Joined 100 groups', '👥', 300, 'groups', 100),
('Group Master', 'Joined 200 groups', '🏘️', 600, 'groups', 200),
('Group Legend', 'Joined 500 groups', '🏢', 1200, 'groups', 500),
('Group Titan', 'Joined 1000 groups', '🏛️', 2500, 'groups', 1000),
('Group God', 'Joined 2000 groups', '🌆', 5000, 'groups', 2000),

-- PHOTO badges (levels 100-10000)
('Photo Rookie', 'Uploaded 100 photos', '📷', 200, 'photos', 100),
('Photo Pro', 'Uploaded 200 photos', '📸', 400, 'photos', 200),
('Photo Master', 'Uploaded 500 photos', '🖼️', 800, 'photos', 500),
('Photo Legend', 'Uploaded 1000 photos', '🎨', 1500, 'photos', 1000),
('Photo Titan', 'Uploaded 2500 photos', '🌄', 3000, 'photos', 2500),
('Photo God', 'Uploaded 5000 photos', '🌅', 6000, 'photos', 5000),
('Photo Immortal', 'Uploaded 10000 photos', '🏞️', 12000, 'photos', 10000),

-- MESSAGE badges (levels 100-50000)
('Chatter', 'Sent 100 messages', '💬', 150, 'messages', 100),
('Talker', 'Sent 500 messages', '🗨️', 400, 'messages', 500),
('Messenger', 'Sent 1000 messages', '📨', 800, 'messages', 1000),
('Chat Master', 'Sent 5000 messages', '📩', 2000, 'messages', 5000),
('Chat Legend', 'Sent 10000 messages', '💌', 4000, 'messages', 10000),
('Chat Titan', 'Sent 25000 messages', '📧', 8000, 'messages', 25000),
('Chat God', 'Sent 50000 messages', '📬', 15000, 'messages', 50000),

-- REACTION badges (levels 100-100000)
('Reactor', 'Gave 100 reactions', '😀', 100, 'reactions', 100),
('Reaction Pro', 'Gave 500 reactions', '😄', 300, 'reactions', 500),
('Reaction Master', 'Gave 1000 reactions', '🤩', 600, 'reactions', 1000),
('Reaction Legend', 'Gave 5000 reactions', '😍', 1500, 'reactions', 5000),
('Reaction Titan', 'Gave 10000 reactions', '🥳', 3000, 'reactions', 10000),
('Reaction God', 'Gave 50000 reactions', '🎭', 10000, 'reactions', 50000),
('Reaction Immortal', 'Gave 100000 reactions', '🌈', 20000, 'reactions', 100000),

-- FOLLOWER badges (levels 100-100000)
('Rising Star', 'Gained 100 followers', '🌟', 300, 'followers', 100),
('Celebrity', 'Gained 500 followers', '💫', 800, 'followers', 500),
('Influencer Pro', 'Gained 1000 followers', '📈', 1500, 'followers', 1000),
('Fame Master', 'Gained 5000 followers', '🎖️', 4000, 'followers', 5000),
('Fame Legend', 'Gained 10000 followers', '🏅', 8000, 'followers', 10000),
('Fame Titan', 'Gained 25000 followers', '🥇', 15000, 'followers', 25000),
('Fame God', 'Gained 50000 followers', '👑', 30000, 'followers', 50000),
('Fame Immortal', 'Gained 100000 followers', '✨', 50000, 'followers', 100000),

-- PROFILE VISIT badges (levels 100-1000000)
('Noticed', 'Profile visited 100 times', '👀', 100, 'profile_visits', 100),
('Watched', 'Profile visited 500 times', '👁️', 300, 'profile_visits', 500),
('Observed', 'Profile visited 1000 times', '🔍', 600, 'profile_visits', 1000),
('Famous', 'Profile visited 5000 times', '📊', 1500, 'profile_visits', 5000),
('Renowned', 'Profile visited 10000 times', '📈', 3000, 'profile_visits', 10000),
('Legendary', 'Profile visited 50000 times', '🌟', 10000, 'profile_visits', 50000),
('Immortal Fame', 'Profile visited 100000 times', '💎', 20000, 'profile_visits', 100000),

-- STORY badges (levels 100-5000)
('Story Teller', 'Posted 100 stories', '📖', 200, 'stories', 100),
('Story Master', 'Posted 200 stories', '📚', 400, 'stories', 200),
('Story Legend', 'Posted 500 stories', '📕', 800, 'stories', 500),
('Story Titan', 'Posted 1000 stories', '📗', 1500, 'stories', 1000),
('Story God', 'Posted 2500 stories', '📘', 3000, 'stories', 2500),
('Story Immortal', 'Posted 5000 stories', '📙', 6000, 'stories', 5000),

-- CHALLENGE badges (levels 100-2000)
('Challenger', 'Completed 100 challenges', '🎯', 400, 'challenges', 100),
('Challenge Master', 'Completed 200 challenges', '🏹', 800, 'challenges', 200),
('Challenge Legend', 'Completed 500 challenges', '⚡', 1500, 'challenges', 500),
('Challenge Titan', 'Completed 1000 challenges', '🔥', 3000, 'challenges', 1000),
('Challenge God', 'Completed 2000 challenges', '💪', 6000, 'challenges', 2000),

-- ACHIEVEMENT badges (levels 100-500)
('Achievement Hunter', 'Earned 100 achievements', '🏆', 500, 'achievements', 100),
('Achievement Master', 'Earned 200 achievements', '🥇', 1000, 'achievements', 200),
('Achievement Legend', 'Earned 300 achievements', '🎖️', 1500, 'achievements', 300),
('Achievement Titan', 'Earned 400 achievements', '💎', 2000, 'achievements', 400),
('Achievement God', 'Earned 500 achievements', '👑', 2500, 'achievements', 500),

-- XP badges (levels 1000-10000000)
('XP Collector', 'Earned 1000 XP', '⭐', 100, 'xp', 1000),
('XP Master', 'Earned 5000 XP', '🌟', 300, 'xp', 5000),
('XP Legend', 'Earned 10000 XP', '✨', 600, 'xp', 10000),
('XP Titan', 'Earned 50000 XP', '💫', 1500, 'xp', 50000),
('XP God', 'Earned 100000 XP', '⚡', 3000, 'xp', 100000),
('XP Emperor', 'Earned 500000 XP', '🔥', 8000, 'xp', 500000),
('XP Immortal', 'Earned 1000000 XP', '🌈', 15000, 'xp', 1000000),
('XP Deity', 'Earned 5000000 XP', '💎', 40000, 'xp', 5000000),
('XP Omniscient', 'Earned 10000000 XP', '👑', 80000, 'xp', 10000000),

-- LEVEL badges (levels 10-100)
('Level 10', 'Reached level 10', '🔟', 200, 'level', 10),
('Level 20', 'Reached level 20', '2️⃣0️⃣', 400, 'level', 20),
('Level 30', 'Reached level 30', '3️⃣0️⃣', 600, 'level', 30),
('Level 40', 'Reached level 40', '4️⃣0️⃣', 800, 'level', 40),
('Level 50', 'Reached level 50', '5️⃣0️⃣', 1000, 'level', 50),
('Level 60', 'Reached level 60', '6️⃣0️⃣', 1200, 'level', 60),
('Level 70', 'Reached level 70', '7️⃣0️⃣', 1400, 'level', 70),
('Level 80', 'Reached level 80', '8️⃣0️⃣', 1600, 'level', 80),
('Level 90', 'Reached level 90', '9️⃣0️⃣', 1800, 'level', 90),
('Level 100', 'Reached level 100', '💯', 5000, 'level', 100),

-- TRADE badges (levels 100-5000)
('Trader Rookie', 'Completed 100 trades', '🔄', 300, 'trades', 100),
('Trader Pro', 'Completed 200 trades', '💱', 600, 'trades', 200),
('Trader Master', 'Completed 500 trades', '📊', 1200, 'trades', 500),
('Trader Legend', 'Completed 1000 trades', '📈', 2500, 'trades', 1000),
('Trader Titan', 'Completed 2500 trades', '🏦', 5000, 'trades', 2500),
('Trader God', 'Completed 5000 trades', '💰', 10000, 'trades', 5000),

-- DONATION badges (levels 100-100000)
('Generous Soul', 'Donated 100 credits', '🎁', 200, 'donations', 100),
('Philanthropist', 'Donated 500 credits', '💝', 600, 'donations', 500),
('Benefactor', 'Donated 1000 credits', '🎗️', 1200, 'donations', 1000),
('Patron', 'Donated 5000 credits', '👼', 3000, 'donations', 5000),
('Patron Saint', 'Donated 10000 credits', '💖', 6000, 'donations', 10000),
('Legendary Patron', 'Donated 50000 credits', '🌟', 15000, 'donations', 50000),
('Divine Patron', 'Donated 100000 credits', '✨', 30000, 'donations', 100000);

-- Update existing badges to have higher requirement values (100+)
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'posts' AND requirement_value = 1 AND name = 'Beginner';
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'posts' AND requirement_value = 10 AND name = 'Active';
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'comments' AND requirement_value = 50 AND name = 'Commentator';
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'videos' AND requirement_value = 10 AND name = 'Video King';
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'friends' AND requirement_value = 10 AND name = 'Friendly';
UPDATE badges SET requirement_value = 100 WHERE requirement_type = 'likes_received' AND requirement_value = 100;