INSERT INTO public.employer_verifications (employer_id, company_name, company_registration_number, company_address, company_website, company_phone, verification_status, reviewed_at)
VALUES (
  'a8f98c5c-3ce8-4928-bfaf-061a700411c6',
  'E2E Test Company',
  'E2E-12345',
  'Bratislava, Slovakia',
  'https://e2etest.example.com',
  '+421900000000',
  'approved',
  now()
);