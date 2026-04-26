---
name: Platform age rating (16+)
description: Main platform is 16+ with DOB gate at signup, blocking under-16 users with a Kids Channel redirect. Kids Channel (6-12) requires parental account.
type: feature
---

## Rule
Main Unique platform is for users **aged 16 and over** (GDPR-aligned).
Children 6-12 must use the dedicated `/kids-channel` with parental controls + Gold Pass.

## Implementation
- **Signup gate**: `src/pages/Auth.tsx` requires `birth_date` (Calendar picker). On submit, age is calculated; if < 16, a friendly block screen appears with a button to `/kids-channel`. The submit button stays disabled until DOB is selected.
- **Persistence**: `birth_date` (ISO `yyyy-MM-dd`) is saved to `auth.user_metadata` AND to `profiles.birth_date` (column already exists).
- **MIN_AGE constant**: defined in `Auth.tsx` — change here if the threshold ever moves.
- **Reusable badge**: `<Age16Badge />` in `src/components/Age16Badge.tsx` with variants (default/subtle/solid/outline) and sizes (xs/sm/md). Optional `withLink` makes it link to `/kids-channel`.
- **Visible everywhere**: Navbar (next to logo), Footer (brand row + bottom bar), Index hero (next to "All-in-One" pill), Auth header + DOB label.
- **Copy**: Footer mentions "Suitable for users aged 16 and over" with a Kids Channel link.
