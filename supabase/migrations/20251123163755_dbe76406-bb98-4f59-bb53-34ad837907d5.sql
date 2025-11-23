-- Update Premium Championship to 150 credits and make it active
UPDATE iq_competitions 
SET 
  entry_fee = 150,
  status = 'active',
  end_time = NOW() + INTERVAL '1 month'
WHERE title = 'Premium Championship';

-- Update descriptions in English
UPDATE iq_competitions 
SET description = 'Elite monthly competition - 90-minute expert test with massive prizes'
WHERE title = 'Premium Championship';