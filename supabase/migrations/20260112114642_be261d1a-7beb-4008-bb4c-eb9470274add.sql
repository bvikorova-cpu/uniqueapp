-- PRODUCTION CLEANUP: Delete all test data

-- Delete test submissions (labeled with [TEST])
DELETE FROM talent_submissions 
WHERE title LIKE '%[TEST]%' OR description LIKE '%[TEST]%';

-- Delete any orphaned votes (votes pointing to non-existent submissions)
DELETE FROM talent_votes 
WHERE submission_id NOT IN (SELECT id FROM talent_submissions);

-- Delete any orphaned comments
DELETE FROM talent_comments 
WHERE submission_id NOT IN (SELECT id FROM talent_submissions);

-- Delete test subscriptions (with test UUIDs)
DELETE FROM megatalent_subscriptions 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Delete test referral earnings linked to test subscriptions
DELETE FROM megatalent_referral_earnings 
WHERE subscription_id NOT IN (SELECT id FROM megatalent_subscriptions);

-- Reset the leaderboard view by refreshing it (it's based on talent_submissions, so cleaning those cleans the leaderboard)