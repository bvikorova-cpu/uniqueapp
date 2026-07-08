## Fáza 5b — plán (4 body + oprava platenia)

### 🔧 A) Oprava platenia (hneď, malý fix)

**Root cause (2 problémy):**
1. `useLearningContent.purchaseContent` posiela `{ contentId, contentType, title, price }`, ale `create-checkout` číta `body.amount` (v centoch) — takže Stripe by účtoval default **€19.99** namiesto skutočnej ceny (napr. €199).
2. Toast "Failed to send request" = FunctionsFetchError. Najpravdepodobnejšie: session expirovala počas kliknutia (JWT rejected na gateway), alebo network fail. Client wrapper aj proxy fungujú (overené `curl`om — endpoint živý).

**Fix:**
- `useLearningContent.ts`: pridať `amount: Math.round(price * 100)`, `productName: title`, a pred invoke znova volať `supabase.auth.getSession()` s auto-refresh (`getUser()`).
- Ak session neplatný → jasný toast "Prihlás sa znova" + presmerovanie na `/auth`.
- Zachytávať `FunctionsFetchError` zvlášť a ukázať "Skontroluj internet / prihlásenie".

---

### 📚 B) 4 hlavné body (Phase 5b) pre 40 kurzov

#### 1. **Video knižnica per lekcia** (najväčšia hodnota)
- Nová akcia `videos` v `module-course-exam` edge function: pre danú lekciu AI (Gemini) vygeneruje 2× kurátorské YouTube search-query stringy (napr. `"cinematic lighting portrait tutorial site:youtube.com"`).
- Cachne do novej tabuľky `module_course_lesson_videos` (lesson_key → [{title, query, embed_url}]).
- Alternatíva bez YouTube API: použijeme YouTube search-embed URL `https://www.youtube.com/embed?listType=search&list={query}` (bez API kľúča, funguje priamo v iframe).
- `CourseCurriculumDialog` dostane pod každou lekciou 1–2 rozbaľovacie video panely.

#### 2. **Progress tracking per lekcia**
- Nová tabuľka `education_lesson_progress` (user_id, course_key, lesson_key, completed_at) + RLS + GRANT.
- Checkbox "Mark lesson complete" v `CourseCurriculumDialog`.
- Progress bar hore v dialógu (X/18 lekcií hotových).
- **Exam zamknutý, kým nie je hotových ≥ 80 % lekcií** (namiesto len "purchased").

#### 3. **Downloadable workbook PDF**
- Nová akcia `workbook` v edge function: vygeneruje celý sylabus (18 lekcií, key points, cvičenia, final project) ako A4 PDF cez `pdf-lib`, uloží do bucketu `certificates` (existuje), vráti URL.
- Tlačidlo "Download Workbook PDF" v curriculum dialógu (unlocked po zaplatení).

#### 4. **Practical exercise submission + AI feedback**
- Nová tabuľka `education_exercise_submissions` (user_id, course_key, lesson_key, submission_text, ai_feedback, score).
- Textarea "Submit your exercise" pod každou lekciou (unlocked po zaplatení).
- Nová akcia `feedback` v edge function: AI (Gemini) posúdi text vs. cvičenie a vráti štruktúrovaný feedback (silné stránky, návrhy, skóre 0–100). **0 kreditov** (kurz už zaplatený).
- Feedback sa uloží a zobrazí, môže sa upravovať a resubmittnúť.

---

### 🗂️ Technický rozpis súborov

**DB migrácie (1 migrácia, 2 tabuľky):**
- `education_lesson_progress` + RLS + GRANT
- `education_exercise_submissions` + RLS + GRANT
- (`module_course_lesson_videos` cache — voliteľné, môže zdieľať `module_course_content_cache`)

**Edge function** `supabase/functions/module-course-exam/index.ts`:
- Pridať akcie: `videos`, `workbook`, `feedback`, `progress_get`, `progress_set`

**Frontend:**
- `src/lib/moduleCourseApi.ts` — pridať `videos()`, `workbook()`, `feedback()`, `progress()`, `markLessonComplete()`
- `src/components/courses/CourseCurriculumDialog.tsx` — pridať progress bar, checkboxy, video paneli, exercise textarea, workbook download
- `src/components/courses/CourseAcademicActions.tsx` — `unlocked` zmeniť na 2-fázové: `purchased` (curriculum+videos+workbook+exercises) vs `readyForExam` (>=80 % lekcií hotových)
- `src/hooks/useLearningContent.ts` — oprava platenia (amount, session refresh, error handling)

---

### ⚠️ Poctivé upozornenia
- **Video kvalita**: YouTube search-embed hrá reálne videá, ale konkrétne video volí YouTube algoritmus (nie my). AI dodá dobré vyhľadávacie frázy → relevantné výsledky, no nie sme kurátori každého jedného videa. Na 100 % kurátorstvo by sme potrebovali YouTube Data API kľúč a manuálnu validáciu.
- **Rozsah**: 40 kurzov × 18 lekcií = **720 lekcií**. AI vygeneruje sylabus/videá on-demand pri prvom otvorení a cachne — nie všetko naraz. Prvý user daného kurzu čaká ~30 s, ďalší okamžite.
- **Kredity**: cvičenia s AI feedbackom sú **zdarma** pre zaplatených userov (rovnako ako curriculum a exam). Náklady znášame my z LOVABLE_API_KEY.

---

### 🎯 Poradie realizácie (v 1 dávke)
1. Migrácia DB (2 tabuľky + RLS + GRANT)
2. Rozšírenie `module-course-exam/index.ts` (videos, workbook, feedback, progress)
3. `moduleCourseApi.ts` — nové metódy
4. `CourseCurriculumDialog.tsx` — kompletný redesign s tabmi (Curriculum | Videos | Exercises | Workbook)
5. `CourseAcademicActions.tsx` — logika `readyForExam`
6. `useLearningContent.ts` — payment fix
7. Verifikácia: `tsgo`, curl na jednu akciu, screenshot curriculum dialógu

**Odhad**: veľká zmena, ~6-8 súborov, jedna migrácia. Idem na to naraz. Potvrď "áno" a začnem.