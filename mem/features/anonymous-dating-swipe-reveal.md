---
name: Anonymous Dating swipe deck & photo reveal
description: Tinder-style anonymous swiping (no photos) + photo reveal free after 7 days or early for 5 credits
type: feature
---

# Anonymous Dating — swipe & photo reveal

- Swiping is FREE and fully anonymous: cards show only DiceBear avatar, anonymous name, age range, location, interests, traits. Never a real photo.
- `anonymous_dating_swipes` (like/pass, unique per swiper+target). Mutual like → `anonymous_dating_matches` row via `anon_date_swipe()` RPC.
- Deck feed: `get_anon_date_deck(_limit)` — excludes self, already swiped, existing matches, blocked users.
- Hidden photo: `anonymous_dating_profiles.photo_path` in private bucket `anonymous-date-photos` (own-folder RLS).
- Reveal rules: automatic after `anonymous_dating_matches.photo_reveal_days` (default 7) days from match creation, or early via `anon_date_unlock_photo()` = 5 credits (unified `ai_credits` + ledger).
- Photo is served only through edge function `anon-date-photo` (service role signed URL, 300s, permission checked).
- UI: `AnonymousSwipeDeck.tsx`, `PrivatePhotoUpload.tsx`, `PhotoReveal.tsx` (inside AnonymousChat).
