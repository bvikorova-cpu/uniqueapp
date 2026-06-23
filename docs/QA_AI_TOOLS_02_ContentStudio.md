# QA — Content Studio (P0)

**URL:** `/content-studio` | **Kredity:** 3 / generácia | **Účty:** A, B

## A. Prístup
1. Otvor `/content-studio` → dashboard, kalendár, draft list, kredity
2. Odhlás → gate
3. Mobile → tabs/accordion miesto split-view
4. Dark mode → kontrast OK

## B. Generovanie obsahu
1. Klik "New Post" → editor otvorený
2. Vyber platformu (IG / TikTok / YouTube / X / Facebook / LinkedIn) → preview sa zmení (aspect ratio, char limit)
3. Vyplň topic prompt → klik AI Generate → caption + hashtagy vygenerované
4. Edit text → counter (IG 2200, X 280) reflectne, varuje pri prekročení
5. Upload media (img/video) → preview rendered, validný formát
6. Upload `fake.exe` → odmietnuté
7. Upload 20MB image → resize alebo error
8. Klik Regenerate caption → ďalšie kredity, nový text
9. Hashtag suggestions → klik tag → pridá sa do textu

## C. Multi-platform preview
1. Vytvor 1 post → switch tabs IG/TT/YT → preview ukáže ako bude vyzerať na každej
2. Crop pre 9:16 vs 1:1 vs 16:9 → manuálny crop tool funguje
3. Per-platform override textu → uloží sa separátne

## D. Scheduling & kalendár
1. Klik na deň v kalendári → "New post" prefilled date
2. Set time (15:30) → klik Schedule → post v kalendári s ikonou clock
3. Drag-drop post na iný deň → date sa zmení (DB update overiť)
4. Klik scheduled post → edit → Save → zmeny uložené
5. Past date → validation error
6. Bulk schedule (10 postov) → všetky v kalendári
7. Klik Publish Now (bypass schedule) → status "published", network call

## E. Draft / Publish flow
1. New post → Save Draft → v "Drafts" list
2. Edit draft → Save → updated_at zmenené
3. Publish draft → presunie sa do "Published", scheduled_at = now
4. Delete draft → confirm → zmazané
5. Duplicate post → kópia v drafts

## F. Kredity
1. Generate 3x rýchlo → 9 kreditov down
2. Insufficient → buy CTA

## G. Multi-user
1. A vytvorí draft → B nevidí (RLS)
2. A publikuje na verejný feed (ak je) → B vidí v feed
3. A naplánuje post → spustí cron (alebo manual trigger) → publikuje → A dostane notifikáciu

## H. Persistencia
1. Vytvor draft → reload → stále tam
2. Naplánuj post na +1h → reload → stále scheduled
3. Logout/login → drafts perzistujú

## I. Error handling
1. Offline počas Save → local cache alebo error toast
2. Network 500 pri Publish → error, draft ostane

## J. i18n
1. SK/CZ/DE → UI preložené, AI generuje v zvolenom jazyku
