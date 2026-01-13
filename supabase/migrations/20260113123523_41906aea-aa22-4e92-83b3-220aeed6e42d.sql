-- Delete all test data from fundraising tables
-- This cleanup ensures production-ready state

-- Delete related data first (donations, withdrawals) then campaigns
DELETE FROM campaign_donations WHERE campaign_type IN ('medical', 'dream', 'hero', 'student', 'pet', 'crisis', 'talent');

DELETE FROM withdrawal_requests WHERE campaign_type IN ('medical', 'dream', 'hero', 'student', 'pet', 'crisis', 'talent');

-- Now delete all campaigns from all 7 fundraising tables
DELETE FROM medical_campaigns;
DELETE FROM dream_campaigns;
DELETE FROM hero_campaigns;
DELETE FROM student_campaigns;
DELETE FROM pet_rescue_campaigns;
DELETE FROM crisis_campaigns;
DELETE FROM talent_campaigns;