# QA — Social & Dating (kompletný manuálny rozpis)

Doména: https://www.uniqueapp.fun
Mena: EUR. Veková brána: 16+ (Dating). Predpokladá sa prihlásený používateľ, ak nie je uvedené inak.

---

## 0. Príprava

### Účty
- **U1 (Alice)** — vek 25, ženské pohlavie, lokalita Bratislava, 100+ kreditov, Stripe karta `4242 4242 4242 4242`.
- **U2 (Bob)** — vek 28, mužské pohlavie, lokalita Bratislava, 30 kreditov, karta `4000 0027 6000 3184` (3DS).
- **U3 (Carol)** — vek 17 (alebo bez vyplneného DOB), 0 kreditov, karta `4000 0000 0000 0002` (decline). Slúži na testy age-gate a edge cases.
- **U4 (Admin)** — admin role pre `/admin/dating-moderation`.

Pri každom účte vyplniť: avatar, bio, záujmy, dátum narodenia, mesto, ciele (priateľstvo/vzťah/nezáväzne), pohlavie + preferencie.

### Stripe testovacie karty
- OK: `4242 4242 4242 4242`
- 3DS challenge: `4000 0027 6000 3184`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`
- CVC: ľubovoľný 3-miestny, expiry ľubovoľný budúci.

### DevTools setup
- Network tab otvorený, filter `Fetch/XHR`, Preserve log ON.
- Console tab, Preserve log ON, filter `error|warn`.
- Application → Local Storage: sleduj `unique-theme-v2`, `i18nextLng`, `sb-*-auth-token`.
- Throttling: Fast 3G pre test pomalej siete v sekcii performance.

### Viewporty
- Mobile 360×640 (default)
- Mobile 414×896 (iPhone Pro)
- Tablet 768×1024
- Desktop 1440×900

### Globálne kontroly pri každom kroku
- Mena vždy EUR (žiadne $, CZK, HUF).
- Texty v zvolenom jazyku (default EN). Prepni cez selektor a over perzistenciu po reload.
- Žiadne console error/warn.
- Žiadne 4xx/5xx v Network okrem dokumentovaných (402 = insufficient credits, 401 = unauth).
- Light theme default, toggle funguje, perzistuje cez reload.

---

## 1. `/wall` — Wall (sociálna sieť)

### 1.1 Feed
1. Otvor `/wall` ako U1. Over hero/header, počet záložiek (Feed, Friends, Groups, Pages, Videos, Events, Saved, Trending, Info, Memories).
2. Posunutie feedu — infinite scroll. Sleduj Network: opakované `posts` queries s offsetom.
3. Filter feedu: All / Following / Trending. Každý filter prepne — over zmenu obsahu a URL/state.
4. Klikni Like, Unlike, Comment, Share, Save na cudzí príspevok. Over realtime aktualizáciu count.
5. Repeat Like 20× rýchlo → over rate-limit (anti-spam toast).

### 1.2 Create post
1. New post → text 280+ znakov, smajlíky, link, mention `@U2`.
2. Pridaj 1 obrázok, potom 4 obrázky (max), potom 11 (over limit).
3. Nahrať video (mp4 < 50MB, potom > limit — očakávaná chyba).
4. Pridaj poll (2-4 možnosti), event, location.
5. Visibility: Public / Friends / Close friends / Only me. Pre každý nastav a over že U2 vidí/nevidí podľa pravidla.
6. Schedule post na +10 min, over že sa zobrazí v Scheduled, automaticky publikuje.
7. Edit post → over history/edited badge.
8. Delete post → over soft-delete (zmizne z feedu U2 do 5s realtime).

### 1.3 Comments
1. U2 komentuje pod post U1. U1 dostane notifikáciu (zvonček + chime — over autoplay policy).
2. Reply na komentár (vnorené). Like komentára. Edit, Delete.
3. Mention `@U3` v komentári → U3 dostane notifikáciu.
4. Comment 1000+ znakov, prázdny, len medzery — validácia.
5. XSS test: `<script>alert(1)</script>` → musí byť sanitized.

### 1.4 Reactions a sharing
1. Long-press Like → výber reakcií (love, laugh, wow, sad, angry).
2. Share → Copy link, Share to Messenger (DM), Share to Group, Share externally (WhatsApp).
3. Repost s vlastným komentárom.

### 1.5 Stories
1. Create story (foto/video, text overlay, hudba, stickers).
2. Visibility Close friends only — U3 (nie close friend) nevidí, U2 (close friend) vidí.
3. Story expires 24h — over `expires_at` v DB / UI countdown.
4. View list — kto videl moju story (len U1 vidí zoznam).
5. Reply na story → ide do DM.

### 1.6 Multi-user realtime
1. U1 a U2 obaja otvoria `/wall`. U1 publikuje post → U2 musí vidieť do 5s bez reloadu.
2. U2 lajkne → counter u U1 sa zvýši realtime.
3. Test 3 simultánnych používateľov píšucich komentáre na ten istý post.

---

## 2. `/friends` a `/close-friends` — Priateľstvá

### 2.1 Vyhľadávanie a žiadosti
1. `/friends` → tab Suggestions, Requests, Sent, All.
2. Vyhľadaj U2 podľa mena/username/email. Pošli Friend request.
3. **Anti-dupe test** (mem://features/friendship-logic): pošli druhú žiadosť → musí byť blokované (toast „Request already sent").
4. Cancel sent request.
5. U2 prijíma → over notifikáciu u U1 (chime + badge), realtime update.
6. U2 odmietne → over že U1 môže poslať znova až po cooldown (over v DB).
7. Block U3 → U3 nemôže vidieť profil, posielať FR, DM.
8. Unblock → over že stav sa reset.

### 2.2 Close friends
1. Pridaj U2 do Close friends. Over že U2 nedostane notifikáciu o tom.
2. Post s visibility Close friends → vidí len U2, nie ostatní priatelia.

### 2.3 Follow/unfollow
1. Follow U2 bez friendship. Over počet followerov/following.
2. Unfollow. Mute friend (nevidím posty, stále friend).

---

## 3. `/wall/groups` — Skupiny

1. Create group → name, description, privacy (Public/Private/Secret), cover, kategória.
2. Pre Private/Secret over že nečlenovia nevidia obsah.
3. Invite U2, U3 → akceptujú, jeden ignoruje.
4. Roles: Admin, Moderator, Member. Promote U2 → moderator. Demote.
5. Post v skupine, pin post (admin only), report post.
6. Group chat — over že chat je viditeľný len členom.
7. Leave group, Delete group (len admin). Transfer ownership.
8. Pre Secret group: vyhľadanie nesmie vrátiť hit pre nečlenov.
9. **Multi-user:** U1 postne v skupine, U2 a U3 vidia realtime.

---

## 4. `/wall/pages` — Stránky

1. Create page (Business/Brand/Personality/Community).
2. Edit cover, profile, description, kategórie, kontakty.
3. Publish post ako stránka (not as osoba).
4. Follow page ako U2. Counter sa zvýši.
5. Roles na stránke (Admin/Editor/Moderator/Advertiser/Analyst).
6. Insights tab — over že čísla zodpovedajú interakciám.
7. Boost post → over redirect na payment (EUR, Stripe).

---

## 5. `/wall/videos` — Videá

1. Upload video < 50MB, > limit (error), nesprávny formát.
2. Thumbnail auto-generation, custom thumbnail.
3. Play, pause, fullscreen, mute, captions.
4. Live stream start (ak dostupné) — over že druhý user vidí stream pod 10s latency.

## 6. `/wall/events` — Events

1. Create event: name, date, location, online/offline, cover, tickets (free/paid v EUR).
2. Invite U2 — RSVP Going/Interested/Not going.
3. Paid event → checkout flow Stripe.
4. Event chat, event posts.
5. Reminder notifikácia 1h pred eventom.

## 7. `/wall/saved` a `/wall/memories`

1. Save post → zobrazí sa v Saved s kategóriami.
2. Memories: posty „on this day" — over že stránka beží aj keď žiadne memórie.

---

## 8. `/messenger` — DM (priame správy)

### 8.1 Conversation list
1. Otvor `/messenger`. Zoznam konverzácií, search, archived, requests, spam.
2. Filter: Unread, All, Groups.
3. Start new chat → vyber U2.

### 8.2 1:1 chat
1. Pošli text, emoji, sticker, GIF, obrázok, video, voice message (record + send), file.
2. Reply na konkrétnu správu (quote).
3. React na správu (❤️ 😂 atď.).
4. Edit, Delete (for me / for everyone — over že delete for everyone vymaže aj u U2).
5. Forward správu inému kontaktu.
6. Typing indicator — over že U2 vidí „typing…" keď U1 píše.
7. Read receipts (modré fajky). Vypni v Settings → over že nezobrazujú.
8. Online/last seen status — over toggle v Settings.

### 8.3 Bezpečnosť & moderácia (mem://features/social-dating-audit-batch)
1. Pošli URL — over že odkaz sa nezmení na clickable bez bezpečnostného check.
2. Skús poslať PII (telefón, email, IBAN) — over masking (mem://src/lib/maskPII).
3. XSS payload v správe — sanitized.
4. Spam: pošli 30 správ za 10s → rate-limit toast.
5. Report message → konverzácia ide do admin moderation.
6. Block user → over že U2 nemôže poslať novú správu, ale história ostane.
7. Mute conversation (1h, 8h, forever) — over že žiadne push/chime (mem://src/hooks/useDmMutes).

### 8.4 Voice/Video calls (ak existuje)
1. Voice call U2 → accept/decline, mute, hangup.
2. Video call → camera switch, screen share.
3. Missed call → notifikácia v chate.

### 8.5 Group chat (mem://src/hooks/useGroupChats)
1. Create group chat (3+ ľudí), name, ikona.
2. Add/remove member (len admin), promote, leave.
3. @mention v group chate → notifikácia adresnému.
4. Read receipts na group chat — kto videl.

### 8.6 Multi-user realtime test
1. U1, U2, U3 v group chate. U1 píše → ostatní vidia typing.
2. U1 pošle → U2 a U3 vidia do 2s.
3. Vypni internet pre U2 (DevTools Offline), U1 pošle 3 správy, U2 sa pripojí → musí dohnať históriu.

### 8.7 Notification chime (mem://src/lib/notificationChime)
1. U1 na `/messenger` v inej konverzácii. U2 pošle správu → chime + toast + badge.
2. U1 na inej stránke (`/wall`) → bell badge + chime.
3. Autoplay policy: nový tab, žiadna user interakcia → chime nesmie spadnúť (graceful fail, ide neskôr).

---

## 9. `/dating` — Hlavný Dating modul

### 9.1 Age gate
1. U3 (17 alebo bez DOB) → vstup na `/dating` musí byť zablokovaný (16+ gate alebo redirect na DOB form).
2. U1, U2 (≥16) → vstup OK.

### 9.2 Onboarding / profil
1. First visit → wizard: fotky (min 2, max 6), bio, výška, povolanie, vzdelanie, deti, fajčenie/alkohol, znamenie, prompts.
2. Verifikácia profilu (selfie check) — submit, čaká v `/admin/dating-moderation`.
3. Edit profile, change main photo, reorder photos (drag).

### 9.3 Discover / swipe
1. Swipe right (like), left (pass), super like (cost X kreditov — over odpočet).
2. Rewind (premium) — vráť poslednú akciu.
3. Filters: vek, vzdialenosť, pohlavie, výška, záujmy, ciele, deti, vzdelanie. Aplikuj a over že výsledky zodpovedajú.
4. Boost (cost kredity) — over že profil je 10 min viditeľnejší.
5. Out of likes → premium upsell modal s EUR cenou.

### 9.4 Match
1. U1 like U2. U2 like U1 → match modal u oboch (realtime).
2. Match → otvorenie chatu z `/dating`.
3. Unmatch → history sa skryje pre oboch, správy zmiznú.
4. Report match (fake, spam, inappropriate) → admin queue.

### 9.5 Anonymous Date `/anonymous-date`
1. Vstup z `/dating` alebo priamo. Profil bez fotky/mena (handle only).
2. Vytvor anonymný profil, vyplň záujmy.
3. Browse, match — over že identity ostane skrytá kým obaja neunlockujú.
4. Reveal request → druhý user musí accept. Po accept obaja vidia real profile.
5. Pay-to-reveal (mem://src/lib/datingAiCredits) — over kredit odpočet a 402 chyby pri 0 kreditoch.
6. RLS test (mem://e2e/anonymous-dating-profiles-rls.spec): curl s tokenom U2 na anonymný profil U1 → musí byť 403/empty.

### 9.6 AI features v Dating (kredity)
1. AI Icebreaker (3-5 kreditov) — vygeneruj otvárač pre match.
2. AI Profile review — analyzuj svoj profil, návrhy.
3. AI Date planner — návrhy rande podľa záujmov.
4. U3 (0 kreditov) → každý AI tool musí ukázať modal „Buy credits" (EUR, žiadne USD).

### 9.7 Dating Chat
1. 24h timer na prvú správu (ak feature existuje) — over expiráciu match.
2. Send text, foto (s blur until accept), voice.
3. Read receipts, typing.
4. **24h refund window** (mem://features/social-dating-logic): po platbe za super-like alebo boost má user 24h na refund cez support flow.
5. Block / Unmatch / Report.

### 9.8 Multi-user scenáre
1. U1 like U2, U2 like U1 → match u oboch realtime.
2. 3-cestný test: U1, U2, U3 — over že match je vždy 1:1.
3. U2 reportne U1 → admin (U4) vidí v `/admin/dating-moderation`, môže ban/warn.
4. Po ban U1 → U1 nemôže swipe, vidí ban screen s odvolaním.

---

## 10. `/skill-swap` — SkillSwap (social learning/dating-adjacent)

### 10.1 Discover
1. `/skill-swap` → grid profilov.
2. Filter: skill offered, skill wanted, lokalita, online/in-person, jazyk.

### 10.2 Profile
1. `/skill-swap/profile/edit` → pridaj skills offered (max 5), wanted (max 5), level, jazyky, dostupnosť, hourly rate (EUR alebo barter).
2. `/skill-swap/profile/:userId` ako U2 → vidíš U1 profil, „Request swap" CTA.

### 10.3 Swap request
1. U1 → U2: request swap (vyber skill, message, dátum).
2. U2 accept/decline → notifikácia u U1.
3. Po accept otvorí sa chat (alebo presmeruje na messenger).
4. Po session: rating 1-5, review (sanitized).
5. Spor → report → admin.

### 10.4 Dashboard
1. `/skill-swap/dashboard` → upcoming, past, requests, earnings (ak paid).

---

## 11. `/quantum-social` — Quantum Social Network

(Súvisí s mystical, ale má social vrstvu)
1. Entangle s U2 — over shared state (likes synced, status mirror).
2. Disentangle.

---

## 12. `/teen-social-coach`

1. Vstup ako U1 (dospelý) — over že je dostupné alebo gated podľa pravidiel.
2. AI coach chat — over kreditové náklady a moderation filter (žiadny dospelý/sexuálny obsah).

---

## 13. `/best-friend`

1. Pridaj best friend (1 entity), interakcie, kompatibilita.

---

## 14. Profile (`/profile/:userId`, `/edit-profile`)

### 14.1 Vlastný profil
1. `/edit-profile` → meno, username (unique check), bio, avatar, cover, lokalita, dátum narodenia (raz nastavený nemení sa bez admin), pohlavie, jazyky, záujmy, social links.
2. Privacy: kto vidí email/telefón (only me / friends / public).
3. Two-factor (ak existuje), change password, delete account (GDPR — mem://features/gdpr-erasure).

### 14.2 Cudzí profil
1. `/profile/:U2id` ako U1 → vidíš public posty, common friends, mutual groups.
2. CTA: Add friend, Follow, Message, Block, Report.
3. Pre Block: skontroluj že po block:
   - U2 nemôže otvoriť tvoj profil (alebo vidí limited view).
   - Existujúce DM ostanú archivované.
   - Vzájomné friendships zrušené.

---

## 15. Notifikácie (cross-modulové)

1. Bell ikona — over všetky typy: friend request, accept, comment, mention, like, DM, match, group invite, event RSVP, page follow.
2. Klik na notifikáciu → správny route (mem://src/utils/notificationRoutes).
3. Mark as read, mark all, delete.
4. Push notifikácie (mem://src/lib/pushNotifications) — povol v prehliadači, vypni v Settings, over že chime nehrá keď je mute (mem://src/hooks/useDmMutes).
5. Email digest (ak existuje) — nastav frekvenciu.

---

## 16. Admin moderation (`/admin/dating-moderation`)

Ako U4:
1. Queue reports: filter by type (fake profile, harassment, scam, inappropriate photo).
2. Otvor report → view kontext (správy, profil, fotky), accept/dismiss/escalate.
3. Action: warn user, suspend (24h, 7d, perma), ban, refund (mem://features/admin-stripe-refund).
4. Audit log — všetky akcie sa logujú (`/admin/audit-log`).
5. Bulk action na 5+ reportov.

---

## 17. Cross-module a security

### 17.1 Kredity konzistentne
1. Otvor `/credits` (alebo wallet) → balance pred/po Dating AI, DM AI assistant, super-like, boost.
2. Pre každú akciu over že odpočet zodpovedá deklarovanej cene (mem://features/ai-credits-policy, mem://features/kids-teen-ai-credit-matrix).
3. U3 (0 kreditov) na každom AI tool → 402 chyba ošetrená UI modalom (mem://features/ai-kredity-chyby).

### 17.2 EUR-only lock
1. Otvor Settings → currency selector — ak existuje, over že je read-only EUR.
2. Sleduj všetky Stripe checkout flows (boost, super-like pack, premium subscription, paid event, page boost, skill-swap paid session) — line items v EUR.
3. Network: nájdi `create-checkout` request → over `currency: "eur"`.

### 17.3 i18n
1. Prepni jazyk 3× (EN → SK → DE → EN), pre každý prejdi `/wall`, `/messenger`, `/dating`. Žiadne fallback keys ako `friends.title_missing`.
2. Reload — jazyk perzistuje (`i18nextLng`).

### 17.4 RLS audit (curl)
1. Získaj access token U2 z DevTools.
2. `curl https://<project>.supabase.co/rest/v1/messages?select=*&conversation_id=eq.<U1-private-conv>` s U2 tokenom → musí 401/empty.
3. To isté pre `dating_profiles`, `friend_requests`, `dm_mutes`, `anonymous_dating_profiles`.

### 17.5 Race conditions
1. Dva taby U1 — like ten istý post 2× rýchlo → counter +1, nie +2.
2. Friend request: U1 a U2 simultánne posielajú FR sebe navzájom → výsledok deterministic (auto-accept alebo jeden zostane pending).
3. Match race: U1 a U2 simultaneously like — match presne raz.

### 17.6 Realtime sharding (mem://features/realtime-presence)
1. Otvor 10 tabov U1 na `/messenger` — over že WebSocket pripojenia neprekročia limit.
2. Idle 30 min → reconnect po user akcii.

---

## 18. Performance & accessibility

1. Lighthouse na `/wall`, `/messenger`, `/dating` — Performance ≥ 70, Accessibility ≥ 90, BP ≥ 90, SEO ≥ 90.
2. TTI < 5s na Fast 3G.
3. CLS < 0.1 (sleduj počas loading feed/messages).
4. Memory leak: 30 min scroll na feed, periodic snapshot → heap rast < 50MB.
5. Keyboard navigation: Tab cez feed, Enter/Space na akcie, Esc na modal.
6. Screen reader (VoiceOver/NVDA) na DM thread — over aria-labels.

---

## 19. Reporting template

```
Modul: [Wall / Messenger / Dating / SkillSwap / ...]
Sekcia: [napr. 8.3 Bezpečnosť & moderácia]
Krok: [číslo zo scenára]
URL: https://www.uniqueapp.fun/...
Účet: U1 / U2 / U3 / U4
Viewport: 360x640 / desktop
Reprodukcia:
  1. ...
  2. ...
Očakávané: ...
Skutočné: ...
Console error: <paste>
Network: <method> <url> → <status> <response snippet>
Screenshot/Video: <link>
Priorita: P0 (blocker) / P1 / P2
```

---

## 20. Odporúčané poradie testovania

1. **P0 (blocker):** 8 Messenger (DM core), 9 Dating (match, swipe, payments), 1 Wall (feed, post), 14 Profile, 17.4 RLS.
2. **P1:** 2 Friends, 3 Groups, 9.5 Anonymous Date, 9.6 AI features, 15 Notifications, 17.1 Kredity.
3. **P2:** 4 Pages, 5 Videos, 6 Events, 7 Saved/Memories, 10 SkillSwap, 11 Quantum, 12 Teen coach, 13 Best friend.
4. **Cross/Final:** 16 Admin moderation, 17 Cross-module, 18 Performance, 19 final regression na 3 viewportoch.

---

Koniec dokumentu.
