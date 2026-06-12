---
name: Profiles public views alignment
description: profiles_public realigned with public_profiles columns; both are interchangeable, public_profiles is canonical.
type: feature
---

- `public.public_profiles` = canonical public-safe view over `profiles`.
- `public.profiles_public` = compatibility alias with the same column set. Do not extend; new code should use `public_profiles`.
- `public.public_profiles_safe` = narrower subset for anonymous/sanitized listings.
- All three are plain `SELECT ... FROM profiles` views with `GRANT SELECT TO anon, authenticated`.
