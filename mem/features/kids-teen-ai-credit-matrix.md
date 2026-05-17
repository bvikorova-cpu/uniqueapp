---
name: Kids & Teen AI Credit Matrix
description: Complete credit gating matrix for all Kids & Teen AI features — table, cost, edge function
type: feature
---

# Kids & Teen AI Credit Matrix (paid-only)

All AI calls must deduct credits server-side. Frontend NEVER bypasses the edge function.

| Module           | Edge Function              | Credit Table              | Cost / call              |
|------------------|----------------------------|---------------------------|--------------------------|
| Homework Helper  | kids-homework-helper       | homework_credits          | 3                        |
| Science Lab      | kids-science-helper        | science_credits           | 2                        |
| Story Creator    | kids-story-generate        | kids_story_credits        | 5 (story)                |
| Story Illustrate | kids-story-illustrate      | kids_story_credits        | 2 / page                 |
| Story TTS        | kids-story-tts             | kids_story_credits        | 1 / page                 |
| Drawing Polish   | kids-drawing-enhance       | kids_drawing_credits      | 4                        |
| Reading: analyze | kids-reading-companion     | kids_reading_credits      | 2                        |
| Reading: quiz    | kids-reading-companion     | kids_reading_credits      | 2                        |
| Reading: define  | kids-reading-companion     | kids_reading_credits      | 1                        |
| Academy hub      | kids-academy-router        | (hub credits)             | 2–3 per action           |
| Teen Career      | teen-career-counselor      | teen_career_credits       | 2–5 per action           |

## Rules
- 402 response → frontend redirects to `/kids-*-pricing` (or `/teen-career-pricing`).
- Credits deducted ONLY after AI success.
- Auto-init row at 0 credits if missing.
- Web Speech Synthesis (Reading Read-Aloud) is FREE — uses browser API, no credits.
