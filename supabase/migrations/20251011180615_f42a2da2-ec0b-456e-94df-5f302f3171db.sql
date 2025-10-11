-- Delete all imported job listings (from Adzuna and other sources)
-- These are identified by having a system user as employer_id or imported email
DELETE FROM job_listings 
WHERE employer_id = '00000000-0000-0000-0000-000000000000'
   OR contact_email LIKE '%imported%'
   OR contact_email LIKE '%adzuna%';