## Stratégia

36 features = ~6-8 týždňov práce. Rozdelíme do 7 fáz po 4-6 features. Každá fáza:
1. DB migrácia (tabuľky + RLS + indexy)
2. Edge functions ak treba (AI, platby, real-time)
3. UI komponenty + integrácia do Wall
4. i18n preklady (12 jazykov)
5. Quick smoke test

Po každej fáze sa zastavíme, ty otestuješ a povieš pokračuj.

---

## Fáza 1 — Quick wins (najmenej DB práce, najväčší efekt)
**Týždeň 1**
1. **Quote repost** — rozšíriť `reposts` tabuľku o `quote_text`, nový dialóg, render
2. **Notes/Status** — nová tabuľka `user_notes` (24h expirácia), bar nad feedom
3. **Carousel posts** — rozšíriť `posts.media_urls` na multi, swiper komponent
4. **Mute words** — `user_muted_keywords`, filter vo feede
5. **Sensitive content warnings** — `posts.is_sensitive` + blur overlay

## Fáza 2 — Privacy & Lists
**Týždeň 2**
6. **Close Friends list** — `user_close_friends`, audience selector pri poste
7. **Mute users dočasne** — `user_mutes` s `expires_at`
8. **Saved searches + topic following** — `saved_searches`, `followed_topics`
9. **Bookmarks folders s notami** — rozšíriť `collections` o description, share token
10. **Cross-posting toggle** (X/FB share intent — bez OAuth, len share URL)

## Fáza 3 — Algoritmický feed & Komunikácia
**Týždeň 3**
11. **For You feed** — edge function `rank-feed` s engagement score (likes×3 + comments×5 + recency decay)
12. **DM reactions na správy** — `message_reactions` tabuľka
13. **DM group chats** — rozšíriť `conversations` o `is_group`, `participants[]`
14. **Quote-share DM** — share post do DM
15. **Profile customization** — banner upload, pinned posts (3), featured links (Linktree)

## Fáza 4 — Audio/Video & Live
**Týždeň 4**
16. **Spaces scheduling + recording** — rozšíriť `audio_rooms` o `scheduled_at`, `recording_url`
17. **Spaces transkripcie** — edge function s OpenAI Whisper
18. **Live chat počas streamu + tipy** — `live_stream_messages`, `live_tips` (Stripe)
19. **Duet/Stitch videí** — `video_remixes` s parent_id
20. **AR filtre** — basic CSS filtre + sticker overlay (bez AR engine)

## Fáza 5 — Communities & Moderation
**Týždeň 5**
21. **Communities (subreddity)** — `communities`, `community_rules`, `community_moderators`, karma
22. **Moderation queue** — `moderation_queue`, admin dashboard
23. **Community Notes** — `post_notes` s crowdsource voting
24. **Report → AI triage pipeline** — edge function `triage-report` (rozšíriť existujúci)
25. **Content warnings UI overlay**

## Fáza 6 — Monetizácia & Commerce
**Týždeň 6**
26. **Paid subscriptions tier** — `creator_subscription_tiers`, Stripe recurring
27. **Branded content tag** — `posts.branded_partner_id`, badge
28. **Shoppable posts** — tag produkty na obrázku, `post_product_tags`
29. **Creator fund visibility** — verejné metriky v profile
30. **Daily login rewards** — `user_login_streaks`, denný credit bonus

## Fáza 7 — Engagement & Pokročilé
**Týždeň 7**
31. **Levels & XP na avatare** — využiť existujúce XP, badge ring okolo avatara
32. **Reaction GIFs** — Tenor API integrácia v komentároch
33. **Push notifications s rich actions** — Web Push + service worker
34. **Offline mód s queue** — IndexedDB queue, replay pri online
35. **Accessibility** — alt-text povinný pri uploade, video captions field
36. **API/Webhooks pre creators** — `creator_webhooks`, sign secret

---

## Technické poznámky

- Všetky tabuľky budú mať RLS policies + indexy
- AI features cez Lovable AI Gateway (gemini-2.5-flash default, 3-5 kreditov)
- Stripe features cez existujúci `create-checkout` router
- i18n cez existujúci scripts/i18n-fill.mjs po každej fáze
- Žiadne breaking changes — všetko nové je opt-in
- Každá fáza má samostatný PR-style commit set

## Čo potrebujem od teba pred štartom

1. **Potvrdenie že ideme fázu po fáze** (nie všetko naraz — to by bol chaos a nedokončené veci)
2. **Priorita** — ísť poradí 1→7, alebo preskočiť niektorú fázu?
3. **Tenor API key** pre Fáza 7 (reaction GIFs) — môžem požiadať keď tam dôjdeme
4. **Web Push VAPID keys** pre Fáza 7 — vygenerujem keď tam dôjdeme

Po schválení začnem **Fázou 1 (Quick wins)** — 5 features, ~jeden veľký commit, hotovo za jednu reláciu.

## ✅ Fáza 3 hotová
- For You ranking via `rank-feed` edge function + SmartFeedTabs (For You / Following / Trending / Latest)
- Message reactions on DM (`message_reactions` reused, hook + UI)
- Group chats via extended `conversations` + new `conversation_messages` table
- Quote-share post → DM via `SharePostToDM`
- Profile customization: banner upload, pinned posts (max 3), featured links
