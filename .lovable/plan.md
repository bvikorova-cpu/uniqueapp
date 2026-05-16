
# Education Upgrade — Competitive Parity Plan

## Východisko (čo už máme)

- `course_quizzes` + `quiz_questions` + `quiz_attempts` (základné kvízy)
- `user_points` (XP + login_streak)
- `iq_credits` + `iq_user_stats` (IQ testy a leaderboard)
- `homework_credits` (3 kredity / AI otázka)
- `teen_career_credits` (5 kreditov / sedenie)
- `analyze-handwriting` edge function (rozbor rukopisu)
- Kids Academy (homework, drawing, reading, science, story, voice chat)
- `useEducationStats` + `useEducationLeaderboard` (XP + streak)

## Čo majú konkurenti a nám chýba

| Feature | Duolingo | Khan | Quizlet | Coursera | Udemy | Brilliant | Photomath | U nás |
|---|---|---|---|---|---|---|---|---|
| Spaced Repetition (SM-2) | ✓ | ✓ | ✓ | – | – | – | – | **chýba** |
| Flashcards (vlastné sady) | – | – | ✓ | – | – | – | – | **chýba** |
| AI Tutor (kontext + chat) | ✓ | ✓ | ✓ | – | – | ✓ | ✓ | čiastočne (homework) |
| Daily Challenge / Quest | ✓ | ✓ | – | – | – | ✓ | – | **chýba** |
| Skill Tree / Learning Path | ✓ | ✓ | – | ✓ | – | ✓ | – | **chýba** |
| Certifikáty po dokončení | – | ✓ | – | ✓ | ✓ | – | – | **chýba** |
| League / Weekly Leaderboard | ✓ | – | – | – | – | ✓ | – | čiastočne (XP only) |
| Achievements / Badges | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | **chýba** |
| Heart / Lives systém | ✓ | – | – | – | – | – | – | (nehodí sa, máme kredity) |
| Study Groups / Classrooms | – | ✓ | ✓ | – | – | – | – | **chýba** |
| Practice Test Generator (AI) | – | ✓ | ✓ | – | – | ✓ | – | **chýba** |
| Solve from Photo (math) | – | – | – | – | – | – | ✓ | **chýba** |
| Step-by-step solver | – | ✓ | – | – | – | ✓ | ✓ | **chýba** |
| Notes / Cheat sheets | – | – | ✓ | – | – | – | – | **chýba** |
| Course progress tracker | – | ✓ | – | ✓ | ✓ | ✓ | – | **chýba** (len attempts) |

## Implementácia — 4 fázy

### Fáza 1: Foundation (DB + univerzálne routery)

**Migrácia:**
- `education_flashcard_decks` (id, user_id, title, description, subject, is_public, card_count)
- `education_flashcards` (id, deck_id, front, back, image_url, hint, order_index)
- `education_srs_state` (id, user_id, card_id, ease, interval_days, repetitions, due_at, last_reviewed_at) — SM-2 algoritmus
- `education_achievements` (id, code, title, description, icon, category, xp_reward, criteria jsonb)
- `education_user_achievements` (id, user_id, achievement_id, unlocked_at)
- `education_daily_challenges` (id, date, type, payload jsonb, xp_reward)
- `education_daily_completions` (id, user_id, challenge_id, completed_at, score)
- `education_skill_tree_nodes` (id, subject, parent_id, title, description, required_xp, order_index)
- `education_user_skill_progress` (id, user_id, node_id, status, completed_at, mastery_score)
- `education_certificates` (id, user_id, course_id, certificate_code, issued_at, score, pdf_url)
- `education_weekly_leagues` (id, week_start, league_tier, user_id, xp_this_week, rank)
- `education_study_groups` (id, owner_id, name, description, subject, invite_code, is_private)
- `education_study_group_members` (id, group_id, user_id, role, joined_at)
- `education_notes` (id, user_id, title, content_md, subject, tags, is_public)
- `education_math_solves` (id, user_id, image_url, problem_text, solution_steps jsonb, credits_used)

Všetky tabuľky: RLS (owner-only mutácie, public-read kde dáva zmysel), `updated_at` trigger, indexy na user_id + due_at/created_at.

**Univerzálny edge router `education-router`** (1 funkcia, action-based — nesplňuje rate-limit):
- `srs.review` — submit review (quality 0–5), prepočítaj SM-2 (ease, interval, due_at)
- `srs.due` — vráť karty splatné dnes
- `daily.today` — vygeneruj/vráť dnešnú výzvu
- `daily.submit` — submit + XP reward + streak update
- `achievement.check` — server-side overenie kritérií a unlock
- `league.update` — bump weekly XP
- `cert.issue` — vygeneruj certifikát PDF po >= passing_score
- `math.solve` — AI solver (foto → kroky), spotrebuje `homework_credits`
- `notes.generate` — AI sumár z course content
- `tutor.chat` — kontextový AI chat (course/lesson aware), `homework_credits`

Routes cez `proxyMap.ts` (zachová sa existujúci pattern).

### Fáza 2: Frontend — Spaced Repetition + Flashcards

- `/education/flashcards` — list deckov + create/edit
- `/education/flashcards/:deckId` — review session (FSRS-lite UI, klávesy 1-5)
- `useFlashcardDecks`, `useSrsQueue` hooky
- AI tlačidlo "Generuj 20 kariet z témy" → `tutor.chat` → batch insert

### Fáza 3: Frontend — Gamification + Skill Tree

- `/education/daily` — denná výzva (5 otázok, 50 XP)
- `/education/achievements` — galéria odznakov s progressom
- `/education/skill-tree/:subject` — vizuálny strom (motion lines, locked/unlocked nodes)
- `/education/league` — týždenný leaderboard po ligách (Bronze → Diamond) — top 10 promo, bottom 5 demote
- Achievement toasts (motion popup pri unlock)
- `useDailyChallenge`, `useAchievements`, `useSkillTree`, `useLeague` hooky

### Fáza 4: Frontend — AI Tools + Social

- `/education/math-solver` — upload foto / nakresli problém → step-by-step (Photomath parita) — kredity
- `/education/ai-tutor` — chat s kontextom kurzu/lekcie (kredity)
- `/education/notes` — markdown editor + AI "summarize this lesson"
- `/education/study-groups` — create/join group, shared decks, group leaderboard
- `/education/certificates` — moje certifikáty + verejný `/cert/:code` overovač
- Course progress tracker komponent (% dokončenia, next lesson, time spent)

## Technické poznámky

- **Spaced repetition:** SM-2 algoritmus (ease 1.3–2.5, interval = prev * ease, quality < 3 reset)
- **Daily challenge:** denne deterministicky seedovaný (date hash → otázky z `quiz_questions` pool)
- **League:** cron edge function (`weekly-league-rollover`) každý pondelok 00:00 UTC — alebo lazy compute pri prvom requeste v týždni (preferované, šetrí slot)
- **Certifikáty:** PDF generovaný v edge funkcii (jsPDF v Deno) + Supabase storage `certificates` bucket
- **Math solver:** Lovable AI Gateway (`google/gemini-2.5-flash` vision) cez `homework_credits` (5 kr/solve)
- **AI tutor:** streaming response, system prompt s kontextom lekcie
- **Rate-limit safe:** všetko cez 1 nový edge function `education-router` + reuse existujúcich (`create-checkout`, `analyze-handwriting`)

## Zachovanie funkčnosti

- Žiadne mazanie existujúcich tabuliek/funkcií
- Existujúce `course_quizzes` / `quiz_attempts` / `user_points` zostávajú a integrujú sa do novej skill-tree + league
- Kids Academy ostáva nedotknutý, prepojí sa s achievements (kid-friendly badges)

## Súbory (odhad)

- 1 migrácia (~15 tabuliek + RLS + triggers)
- 1 nový edge function `education-router/index.ts`
- Update `proxyMap.ts`
- ~12 nových hookov v `src/hooks/`
- ~10 nových stránok v `src/pages/education/`
- ~20 nových komponentov v `src/components/education/`
- Update `App.tsx` routes
- Update `MegaTalentCategoryGrid` / Education hub linky

## Odhad rozsahu

Veľký — 4 fázy, každá samostatne testovateľná a deploynuteľná. Po schválení plánu spustím **Fázu 1 (DB migrácia + edge router)** ako prvú, potom budem postupovať fáza za fázou s priebežnými QA checkmi.
