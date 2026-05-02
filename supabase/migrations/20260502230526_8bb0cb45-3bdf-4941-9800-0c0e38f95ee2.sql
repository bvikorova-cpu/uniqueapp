UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email LIKE 'audit-test-%@uniqueapp.fun' 
  AND email_confirmed_at IS NULL;