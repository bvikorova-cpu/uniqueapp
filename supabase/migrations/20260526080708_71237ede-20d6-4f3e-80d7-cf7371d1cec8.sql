DELETE FROM public.job_applications WHERE job_id IN (SELECT id FROM public.job_listings WHERE title='Senior React Developer (E2E TEST)');
DELETE FROM public.job_listings WHERE title='Senior React Developer (E2E TEST)';
DELETE FROM public.employer_verifications WHERE employer_id='a8f98c5c-3ce8-4928-bfaf-061a700411c6';
DELETE FROM public.notifications WHERE type IN ('verification_request','job_application','job_match') AND actor_id='a8f98c5c-3ce8-4928-bfaf-061a700411c6';