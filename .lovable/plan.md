## Cieľ
Postupne implementovať všetkých 16 Facebook-parity oblastí, ktoré sme identifikovali. Každá fáza je samostatne nasaditeľná a použiteľná end-to-end (DB + RLS + edge functions + UI + integrácia do Wall/profilu).

## Rozsah a realita
Toto je rozsah cca 60–100 hodín práce, **~20–30 nových DB tabuliek**, ~15 edge functions a ~80 nových komponentov. Implementujem to v **8 fázach** (Phase 8 → 15). Každú fázu dokončím end-to-end pred prechodom na ďalšiu, otestujem, a po dokončení každej dostaneš zhrnutie + zoznam vecí na overenie.

Po dokončení každej fázy sa zastavím a počkám, kým mi povieš "pokračuj" alebo dáš spätnú väzbu — aby sme nešli slepo cez 8 fáz bez kontroly.

---

## Phase 8 — Sociálny graf & vzťahy (gap #1)
- DB: `friendships` (status: pending/accepted/blocked), `friend_suggestions`, `family_relationships`, `life_events`
- RLS: priateľstvá obojstranné, rodinné vzťahy obojstranné potvrdenie
- Edge fn: `friend-suggestions` (people-you-may-know algoritmus na základe spoločných priateľov, lokality, hubs)
- UI: Friend request inbox, "People you may know" widget vo Wall pravom stĺpci, Followers vs Friends rozlíšenie na profile, Family section na profile, Life Event post type s ikonami
- Integrácia: feed boost pre posty od priateľov

## Phase 9 — Posty & Feed power-ups (gap #2)
- DB: `post_memories_daily` view, `post_polls`, `post_polls_votes`, `post_locations` (s lat/lng), `post_face_tags`
- Edge fn: `daily-memories` (cron, generuje "On this day" notifikácie), `geocode-place` (Nominatim/OSM zdarma)
- UI:
  - Memories widget na vrchu feedu ("On this day, X years ago")
  - Polls v komentároch (PollCreator + PollVoter)
  - Background-color text-only postov (preset farby) — auto, keď je len text bez médií
  - Check-in dialog s OSM autocomplete (žiadny Google API)
  - Cross-post do skupín jedným klikom (multi-select)
  - Face tagging na obrázkoch (klik na pozíciu → tag používateľa)

## Phase 10 — Skupiny 2.0 (gap #3)
- DB rozšírenie existujúcich groups: `group_roles` (admin/moderator/expert/member), `group_rules`, `group_join_questions`, `group_join_answers`, `group_units` (lessons), `group_insights_daily`
- RLS: role-based (admin = full, moderator = moderate posts, expert = pinned tag)
- Edge fn: `group-auto-moderation` (keyword filter na nové posty), `group-insights-aggregator` (denný cron)
- UI: Group settings panel s rolami, Rules editor, Join questions, Insights dashboard pre adminov, Units (lessons) tab so sequenced lessons

## Phase 11 — Marketplace & Events & Pages (gaps #4, #5, #6)
**11a — Marketplace**
- DB: `marketplace_listings` (categories, condition, price EUR, location), `marketplace_saved_searches`, `marketplace_messages` (využije Messenger)
- UI: `/marketplace` route, kategórie (Vehicles, Electronics, Home, Fashion, Hobby), grid + filters, listing detail s "Message seller"

**11b — Events**
- DB: `events`, `event_rsvps` (going/interested/declined), `event_co_hosts`, `event_recurring_rules`, `event_tickets` (Stripe Connect 80/20)
- Edge fn: `event-reminders` (cron 24h/1h pred eventom), `event-checkout` (Stripe ticketing)
- UI: `/events` route, EventDetail s RSVP buttons, calendar view, ticket purchase flow, post-event recap, Birthdays widget vo Wall pravom stĺpci

**11c — Pages**
- DB: `pages` (oddelené od `profiles`), `page_admins` (role: admin/editor/advertiser/analyst), `page_reviews`, `page_insights_daily`, `page_auto_replies`
- Edge fn: `page-insights`, `page-auto-reply` (keyword → predefined response v Messengeri)
- UI: `/pages/create`, page profile s reviews, page management dashboard, scheduled posts (využije existujúci usePostScheduling)

## Phase 12 — Messenger 2.0 (gap #7)
- DB: `chat_threads` (1:1, group), `chat_members` (s roles + nicknames per chat), `chat_polls`, `chat_calls` (recording session metadata), `chat_secret_keys` (E2EE pre secret conversations)
- Edge fn: `chat-call-token` (generuje LiveKit/Daily.co token alebo Agora — vyberieme zdarma tier), `chat-e2ee-keyexchange`
- UI:
  - Skupinové chaty s admin rolami
  - Voice/Video call (1:1 + group) cez WebRTC
  - Group chat polls
  - Custom nicknames per chat
  - Secret conversation toggle (E2EE klientske šifrovanie messages pred uložením)
- Pozn: Pre WebRTC potrebuješ **LiveKit Cloud** alebo **Agora.io** API key (free tier do 10k min/mesiac). Spýtam sa pred Phase 12.

## Phase 13 — Stories, Reels & Watch (gaps #8, #9)
**13a — Stories**
- DB: `stories` (24h TTL via cron), `story_views`, `story_replies`, `close_friends_lists`
- Edge fn: `story-cleanup` (cron mažúci po 24h)
- UI: Stories tray na vrchu Wall, StoryViewer s tap-to-advance, StoryReplyBar (DM), "Close Friends" toggle

**13b — Reels**
- DB: `reels`, `reel_likes`, `reel_remixes` (duet/stitch parent_id)
- Edge fn: `reel-feed` (algoritmus: čerstvé + lokácia + hubs)
- UI: `/reels` vertikálny swipe feed (Framer Motion), native editor s text overlays, hudobná knižnica (free music — Pixabay/Mixkit API)

**13c — Watch**
- UI: `/watch` route — central video tab s "Continue watching" (localStorage progress), Premieres (scheduled video) so live chat
- Edge fn: `premiere-scheduler`

## Phase 14 — Monetizácia, Discovery, Notifikácie (gaps #10, #14, #13)
- DB: `creator_subscriptions` (tier-based subs s benefits), `live_stars` (tip počas livestream), `subscriber_only_posts`, `notification_preferences` (granular per-type), `hashtag_pages_cache`, `trending_topics_country`
- Edge fn: `live-stars-checkout` (Stripe), `creator-sub-checkout`, `trending-aggregator` (cron)
- UI:
  - Creator subscription tiers na page profile
  - Live Stars tip button v live streame
  - Subscriber-only posts (lock icon)
  - Notification settings page (granular toggles)
  - Hashtag pages `/hashtag/:tag` (Top/Recent/People tabs)
  - Trending topics widget per country
  - Globálny full-text search (`/search`) cez `to_tsvector` indexy na posts/comments/profiles/groups/events

## Phase 15 — Bezpečnosť, Accessibility, Cross-posting (gaps #12, #15, #16)
- DB: `trusted_contacts` (3-5 ľudí), `login_alerts`, `off_platform_activity`, `account_legacy` (memorialization, legacy contact)
- Edge fn: `login-alert-trigger` (auth hook), `account-recovery-trusted-contacts`, `auto-alt-text` (Lovable AI Gateway gemini-2.5-flash → image caption)
- UI:
  - Privacy Checkup wizard (4-step sprievodca)
  - Trusted contacts setup
  - Login alerts page s mapou (free IP geolocation cez ip-api.com)
  - Memorialization request flow
  - Auto alt text pre nahrávané fotky (background job)
  - High-contrast mode toggle (CSS variant)
  - Keyboard shortcut overlay (`?` opens modal)
  - Account Center page (prepojené účty: Instagram OAuth, Threads, X) — len UI scaffold + Instagram OAuth ako prvé

---

## Detaily, ktoré budú potrebné cestou

**Externé služby a secrets, na ktoré sa spýtam pred príslušnou fázou:**
- Phase 12: LiveKit alebo Agora API key (voice/video calls)
- Phase 13b: žiadny secret nutný (Pixabay free music CDN)
- Phase 15: žiadny secret (ip-api.com free + Lovable AI pre alt text)

**Čo NEBUDEM implementovať bez explicitného súhlasu:**
- Self-serve Ad Manager (gap #11) — naschvál vynechané, lebo si paid-only platforma a reklamy by kanibalizovali tvoj model. Spýtam sa na konci, či to chceš.
- Foursquare-like miest databáza — nahradím Nominatim/OSM (zdarma)
- Music licensing (autorské práva) — použijem royalty-free knižnice, nie Spotify/komerčnú hudbu

## Ako budem postupovať
1. Začnem **Phase 8** (sociálny graf) — najpodstatnejšie, lebo všetko ostatné na ňom stojí
2. Po dokončení každej fázy: zhrnutie + zoznam vecí na overenie + počkám na tvoje "pokračuj"
3. Ak narazím na blocker (chýbajúci secret, technické rozhodnutie) — spýtam sa skôr ako budem hádať
4. Kódom udržujem konzistenciu s tvojím dizajnovým systémom (purple #270, glassmorphism, EUR, English default, 16+)

## Časový odhad
- Phase 8: ~1 sedenie
- Phase 9: ~1 sedenie
- Phase 10: ~1–2 sedenia
- Phase 11: ~2–3 sedenia (3 sub-features)
- Phase 12: ~2 sedenia (WebRTC je komplex)
- Phase 13: ~2–3 sedenia
- Phase 14: ~2 sedenia
- Phase 15: ~1–2 sedenia

**Spolu: ~12–16 sedení.** Po každej fáze sa zastavím.

Po schválení tohto plánu spustím **Phase 8** a budem priebežne updatovať task tracker.
