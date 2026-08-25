---
name: Kids & Teen AI Credit Matrix
description: Credit gating matrix for all Kids & Teen AI features — unified ai_credits, Gold Pass retired
type: feature
---

# Kids & Teen AI Credit Matrix (paid-only, unified `ai_credits`)

Kids Gold Pass subscription is RETIRED (Aug 2026). All Kids/Teen AI features are
credit-based on the single `ai_credits` balance. Credits are bought only on
`/ai-credits`; all `/kids-*-pricing` and `/teen-career-pricing` routes redirect there.
Admins keep unlimited access (`hasKidsGoldPass` = admin check only).

| Module           | Edge Function              | Credit Table | Cost / call |
|------------------|----------------------------|--------------|-------------|
| Homework Helper  | kids-homework-helper       | ai_credits   | 3           |
| Science Lab      | kids-science-helper        | ai_credits   | 3 (analyze 4) |
| Story Creator    | kids-story-generate        | ai_credits   | 8           |
| Story Illustrate | kids-story-illustrate      | ai_credits   | 3 / page    |
| Story TTS        | kids-story-tts             | ai_credits   | 2 / page    |
| Drawing Polish   | kids-drawing-enhance       | ai_credits   | 5           |
| Reading: analyze | kids-reading-companion     | ai_credits   | 3           |
| Reading: quiz    | kids-reading-companion     | ai_credits   | 3           |
| Reading: define  | kids-reading-companion     | ai_credits   | 1           |
| Academy actions  | kids-academy-router        | ai_credits   | 3           |
| Character Chat   | character-chat (kids mode) | ai_credits   | 1 / message |
| Teen Career      | teen-career-counselor      | teen_career_credits | 2–5   |

## Rules
- Math games and free Kids content stay open — no credits, no gate.
- `KidsGoldPassGate` = credit gate: admin bypass, else requires ≥1 `ai_credits`;
  paywall shows the price list and links to `/ai-credits`.
- 402 response → user is sent to `/ai-credits`.
- Credits deducted ONLY after AI success (chat reserves and refunds on failure).
- Web Speech Synthesis (Reading Read-Aloud) is FREE — browser API, no credits.
