# Scale-Readiness Batch (Supabase Pro)

Cieľ: posunúť social & dating z "1M ready" na "10-100M ready". Plný 1B+ vyžaduje multi-region active-active mimo Lovable — to neriešim.

## Čo Pro plan už dáva zadarmo
- PgBouncer transaction pooler (port 6543) — netreba kód
- Read replicas — netreba kód, len failover URL
- Supabase Storage CDN (Cloudflare) — automatické
- Realtime 500 concurrent / 2M msg / mesiac — stačí na ~100k DAU
- Daily backups, 7-day PITR

→ Body **1, 5** = vybavené Pro planom, žiadna zmena kódu.

## Čo implementujem v tejto dávke

### A. Global rate-limit (bod 9) — 1 migrácia
- Tabuľka `public.rate_limit_buckets(user_id, bucket, window_start, count)` s unique key.
- Funkcia `public.check_rate_limit(_bucket text, _max int, _window_seconds int) returns boolean` — SECURITY DEFINER, increments + returns false ak prekročené.
- Cleanup cron: zmaže staré buckets > 24h.
- Použitie: zavolá sa z edge fns (post-comment, send-dm, follow, like, swipe) cez RPC.

### B. Text moderation (bod 8) — 1 edge fn
- `moderate-text` edge fn: vstup `{ text }`, výstup `{ allowed, flagged_categories, severity }`.
- Volá Lovable AI Gateway (`google/gemini-2.5-flash-lite`) s moderation promptom — žiadne externé kľúče.
- Drop-in: `post-confession` už má denylist; pridám volanie tejto fn aj do `send-dm`, `create-post`, `add-comment` (ak existujú).

### C. Image moderation (bod 7) — 1 edge fn
- `moderate-image` edge fn: vstup `{ image_url }`, volá Gemini Flash 2.5 vision s NSFW/CSAM klasifikáciou.
- Háčik v storage upload handleroch (post-image-upload, dating-photo-upload) → ak `flagged`, sa zmaže + log do `content_moderation`.
- CSAM pri match → okamžitý ban + log pre admin.

### D. Full-text search (bod 4) — 1 migrácia
- GIN indexy na `posts(content)`, `profiles(full_name, username, bio)`, `job_listings(title, description)`, `communities(name, description)` cez `to_tsvector('simple', ...)`.
- RPC `search_posts(q text, limit int)`, `search_profiles(q text, limit int)`.
- Nahradí dnešné `ilike '%q%'` ktoré nepoužíva index.

### E. Feed cache denormalizácia (bod 2) — 1 migrácia
- Tabuľka `user_feed_cache(user_id, post_id, score, inserted_at)` PK `(user_id, post_id)`.
- Trigger na `posts`: po inserte fan-out do followers (cap 5000 — celebrity účty riešené pull-on-read).
- `get_wall_feed` RPC upravený: najprv číta z cache, ak prázdne → fallback na live query.
- Cron: nightly trim starých záznamov > 30 dní.

### F. Spam/bot signály (bod 6) — 1 migrácia + 1 fn
- Stĺpec `profiles.spam_score` (int), `profiles.account_age_hours` (computed).
- DB fn `compute_spam_score(_user_id)` — heuristika: vek <24h + >10 follow akcií + 0 avatar + 0 bio = high score.
- Trigger na `follows`, `dating_swipes`: ak `spam_score > 70`, blok insertu.

### G. Hot-path indexy (perf) — 1 migrácia
- `posts(created_at DESC) WHERE deleted_at IS NULL`
- `dating_swipes(user_id, created_at DESC)`
- `notifications(user_id, read_at, created_at DESC)`
- `conversation_messages(conversation_id, created_at DESC)`
- `follows(follower_id), follows(following_id)` (ak chýbajú)

### H. APM — Sentry (bod 13) — 1 secret + 2 súbory
- Pridať `@sentry/react` + init v `main.tsx` (SENTRY_DSN secret).
- Edge fn wrapper `sentryWrap` pre serverové errory.
- User povie či má Sentry účet, alebo to vynechám.

## Čo NEROBÍM

- **Bod 3 (Realtime sharding)** — Pro plan dáva 500 concurrent, do 100k DAU netreba sharding. Nad 100k = vlastná infra.
- **Bod 10 (GDPR erasure)** — už hotové (`gdpr_purge_user_data`).
- **Bod 11 (Age verification)** — Yoti/Veriff integrácia = €€€ + KYC kontrakt, vyžaduje user rozhodnutie.
- **Bod 12 (Reporting/appeals UI)** — existuje `content_reports`, `brand_moderation_appeals`. DSA-grade SLA UI = separátny ticket.
- **Bod 14 (Load tests)** — k6/Artillery nepatrí do prod kódu, beží sa lokálne.

## Poradie execution
1. Migrácia A+D+E+F+G (jeden DB push)
2. Edge fns B + C
3. Hook B/C do existujúcich create-post/send-dm/upload paths
4. Sentry (ak user dodá DSN)

Schválenie potrebné — migrácia mení ~10 tabuliek/funkcií. Pokračujem?