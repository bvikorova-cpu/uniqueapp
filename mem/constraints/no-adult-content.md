---
name: No erotic/nude/sexual content
description: Platform-wide ban on erotic, nude and sexual media/text; enforced by moderate-image (strict) + moderate-text and pre-upload screening via src/lib/mediaModeration.ts.
type: constraint
---

Erotic, nude, pornographic and sexually suggestive content is FORBIDDEN platform-wide (posts, videos, stories, reels, Megatalent, premium videos). No opt-in adult zones.

**Why:** owner decision (Aug 2026) — general-audience 16+ platform.

**How to apply:**
- Any new media upload surface MUST call `screenMediaFile(file)` from `src/lib/mediaModeration.ts` BEFORE upload and abort with `NSFW_BLOCK_MESSAGE`.
- Videos are screened by sampling 3 frames (start/middle/end) client-side and sending them to `moderate-image` (`image_urls` batch; accepts data URLs).
- `moderate-image` prompt blocks nudity, partial nudity, lingerie-as-subject, see-through, sexual acts/posing, fetish, sex toys; zero tolerance CSAM. Ordinary beachwear/sport/medical/breastfeeding allowed.
- `moderate-text` blocks erotic/sexual/porn/escort text and nudes solicitation; mild profanity + non-sexual flirting allowed.
- Remove any legal copy that permits "adult content in age-gated zones".
