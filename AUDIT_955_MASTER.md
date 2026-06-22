# Master Checklist (938 sections, 2920 items)

## 1. 1. Onboarding & Registrácia
- [ ] Otvor /auth → vyplň email + heslo (min. 8 znakov, 1 číslo)
- [ ] Skontroluj validáciu slabého hesla (red label)
- [ ] Po submit: prijatý verifikačný email do 30 s
- [ ] Klikni verifikačný link → redirect na /welcome
- [ ] Onboarding wizard: krok 1 (jazyk), 2 (záujmy), 3 (avatar)
- [ ] Skip onboarding → profil označený `is_onboarded=false`
- [ ] Google login → callback /auth/callback
- [ ] Apple login (iOS Safari)
- [ ] Skontroluj že nový OAuth user dostane default credits (free_tier_credits)
- [ ] /auth → 'Zabudnuté heslo' → email s reset linkom
- [ ] Reset link platný 60 min, po expirácii chyba
- [ ] Nové heslo → automatický login

## 2. 2. Profil & Nastavenia
- [ ] /profile/:username → 'Edit Profile'
- [ ] Upload avatar (max 5 MB, JPG/PNG/WebP)
- [ ] Cover image (max 10 MB)
- [ ] Bio max 500 znakov + emoji picker
- [ ] Social links (Instagram, TikTok, YouTube) validácia URL
- [ ] Privacy: public / friends-only / private
- [ ] /settings → Account, Notifications, Privacy, Billing, Language, Appearance
- [ ] Notifications: email on/off pre každý typ (mentions, DMs, reactions, follows)
- [ ] Privacy: blocked users list, kto ma môže pozvať do skupín
- [ ] Billing: aktívne predplatné, faktúry (PDF download)
- [ ] Language switcher: 12 jazykov, zmena okamžitá + persisted
- [ ] Appearance: dark/light/system, font size
- [ ] Danger zone: Delete account (GDPR erasure trigger)

## 3. 3. Notifikácie & Realtime
- [ ] Otvor /notifications → zoznam podľa typu (mentions, replies, likes, follows, system)
- [ ] Filter: All / Unread / Mentions
- [ ] Mark all as read
- [ ] Klik na notif → deep-link na zdroj (post, komentár, profil)
- [ ] Pri prvej návšteve: prompt 'Enable push notifications'
- [ ] Service Worker registered → DevTools → Application → SW active
- [ ] Test push: pošli DM z druhého účtu → notifikácia príde aj keď tab zavretý
- [ ] Chime zvuk pri DM (notificationChime.ts)
- [ ] Otvor profil iného usera → 'Online now' badge ak je aktívny
- [ ] DM konverzácia: typing indicator (3 dots)
- [ ] Live stream: viewer count realtime

## 4. 4. Direct Messages (DM unified)
- [ ] /messages → list konverzácií, sorted by last_message_at
- [ ] Nová konverzácia: search user → start chat
- [ ] Send text, emoji, image, video, voice note
- [ ] Read receipts (modré fajky)
- [ ] Edit / delete vlastnú správu (do 5 min)
- [ ] Mute conversation (1h/8h/1d/forever)
- [ ] Block user → konverzácia zmizne, nové správy blokované
- [ ] Report message → admin moderation queue
- [ ] Creator subscription: lock message → 'Unlock for 5 €'
- [ ] Stripe checkout → po platbe content unlocked
- [ ] 85/15 split overený v transactions table
- [ ] Klik na ikonu telefónu → CallContext → ringing
- [ ] Druhý user accept / decline
- [ ] Video call: kamera + mic permission
- [ ] Hangup → call_logs záznam s duration

## 5. 5. Search & Discovery
- [ ] Top bar search → debounced (300 ms)
- [ ] Tabs: People, Posts, Hashtags, Groups, Pages, Events
- [ ] FTS s trigram indexom → typo tolerance
- [ ] Klik na výsledok → deep-link
- [ ] /explore → trending posts (algoritmus engagement_score)
- [ ] Filter: Today / Week / Month
- [ ] Hashtag page /tag/:slug → posts + follow tag button

## 6. 6. Stories & Memories
- [ ] Wall top: stories carousel, vlastný 'Add story' button
- [ ] Upload image/video (max 30 s)
- [ ] Story prežíva 24 h, potom auto-delete
- [ ] Viewers list (kto videl)
- [ ] React s emoji + reply DM
- [ ] /memories → 'On this day' posts z minulosti
- [ ] Share memory → repost na wall

## 7. 7. Moderation & Anti-abuse
- [ ] Report post/comment/user → modal s reason (spam, hate, nudity, other)
- [ ] Po submit: zobraz toast 'Report received'
- [ ] Admin: /admin/reports → queue, action (warn/suspend/ban)
- [ ] Post s nahým obsahom → AI klasifikuje → auto-hide + flag
- [ ] Toxic comment → shadowban (visible len autorovi)
- [ ] Spam: 30+ postov za minútu → 429 + cooldown 5 min
- [ ] DM flood: 50+ správ rôznym userom za 10 min → block

## 8. 8. Stripe Connect, KYC, Disputes
- [ ] /creator/onboarding → Stripe Connect Express link
- [ ] Vypln údaje na Stripe → redirect späť
- [ ] Status: pending → verified
- [ ] Bez KYC: payout button disabled
- [ ] /creator/earnings → balance, history
- [ ] Request payout → min. 20 €
- [ ] Auto-payout cron: každý piatok ak balance ≥ 50 €
- [ ] Webhook: transfer.created → update payout_history
- [ ] Stripe dispute → admin notification email
- [ ] /admin/disputes → evidence upload
- [ ] Refund: /admin/transactions → refund button → Stripe API

## 9. 9. GDPR, Legal, Cookies
- [ ] Prvá návšteva: banner dole 'Accept / Customize / Reject'
- [ ] Customize: Necessary / Analytics / Marketing toggles
- [ ] Volba uložená 12 mesiacov
- [ ] /terms, /privacy, /cookies, /imprint - musia byť reachable z footer
- [ ] 16+ age gate na /signup
- [ ] /settings → Delete account → 30-day grace period
- [ ] Po 30 dňoch: anonymizácia (profiles.email = null, posts.author_id = 'deleted')
- [ ] Download my data → ZIP s JSON exportom

## 10. 10. SEO, PWA, Performance
- [ ] View source: <title> unique per route, <meta description> < 160
- [ ] OG tags: og:title, og:image, og:url
- [ ] JSON-LD schema na /jobs/:id, /event/:id
- [ ] robots.txt + sitemap.xml + sitemap-jobs.xml accessible
- [ ] Canonical URL na duplicate routes
- [ ] manifest.webmanifest valid → Lighthouse PWA score > 90
- [ ] Install prompt na mobile (Add to Home Screen)
- [ ] Offline: /offline.html sa zobrazí pri network fail
- [ ] Service Worker cache: hero videos, fonts
- [ ] LCP < 2.5 s, FID < 100 ms, CLS < 0.1
- [ ] Lighthouse Performance > 80 mobile, > 90 desktop
- [ ] Bundle size < 500 KB initial (scripts/bundle-report.mjs)
- [ ] Language switcher: SK, EN, DE, FR, ES, IT, PL, HU, CS, UK, RU, HR
- [ ] Default EN, persisted v localStorage + profile
- [ ] i18n-check.mjs: 0 missing keys
- [ ] RTL test (ak je AR/HE) - tu N/A
- [ ] Všade € (EUR) - žiadne $ ani Kč
- [ ] Stripe checkout: amount v centoch, currency='eur'
- [ ] Server-side currency lock (nemožno prepnúť client-side)
- [ ] Keyboard nav: Tab cez celý wall, focus ring viditeľný
- [ ] ARIA labels na iconách (aria-label='Like')
- [ ] Color contrast WCAG AA (4.5:1)
- [ ] Screen reader: VoiceOver/NVDA test home page

## 11. 11. CREATOR ECONOMY – /creators
- [ ] /creators/:slug – avatar, bio, subscription tier, posts.
- [ ] 'Subscribe' → Stripe (mesačné/ročné).
- [ ] 85/15 split (creator/platforma).
- [ ] Post označený 'Pay to unlock' (€X) → blur kým platba neprejde.
- [ ] Po platbe odomknutý natrvalo pre kupujúceho.
- [ ] Paid DM (creator nastaví cenu za správu).
- [ ] Tip jar v chate.
- [ ] Creator KYC cez Stripe Connect onboarding.
- [ ] Earnings dashboard, withdraw → 1–3 dni na účet.

## 12. 12. Edge Functions & Resilience
- [ ] supabase/functions/* - každá funkcia má try/catch + log
- [ ] Test 4xx: zlý payload → friendly error toast
- [ ] Test 5xx: edge function down → fallback UI
- [ ] Timeout > 30 s → abort + retry button
- [ ] Stripe webhook: idempotency key check
- [ ] Reconciliation cron: denne porovná Stripe vs DB transactions
- [ ] Dead letter queue pre failed webhooks

## 13. 13. Analytics & Admin Dashboards
- [ ] /admin/analytics → DAU, WAU, MAU graf
- [ ] Cohort retention table (D1, D7, D30)
- [ ] Funnel: signup → onboarded → first post → paying
- [ ] /admin/platform-earnings → MRR, ARR, churn %
- [ ] Breakdown: subscriptions / PPV / tips / marketplace
- [ ] Export CSV
- [ ] /admin/xp-audit → anomalies (10 000+ XP za deň)
- [ ] Reconciliation: recompute leaderboard

## 14. 14. Affiliate & Referral (deep)
- [ ] /referral → unique code (8 znakov)
- [ ] Share button: copy / WhatsApp / Telegram / Email
- [ ] Tier progression: Bronze (1+) → Silver (10) → Gold (50) → Platinum (200)
- [ ] 10 % z first payment referees
- [ ] Cookie: 30 days attribution
- [ ] Anti-fraud: same IP, same device fingerprint = invalid
- [ ] Leaderboard top 100

## 15. 15. Záverečný smoke check
- [ ] Chrome desktop + Android
- [ ] Safari iOS 16+
- [ ] Firefox desktop
- [ ] Edge desktop
- [ ] 360 × 620 (najmenší mobil)
- [ ] 768 × 1024 (tablet)
- [ ] 1440 × 900 (desktop)
- [ ] 1920 × 1080 (FullHD)
- [ ] 0 errors v console na všetkých kľúčových routes
- [ ] 0 failed network requests (200/3xx OK)
- [ ] Žiadne CORS chyby
- [ ] Žiadne hydration mismatch warnings

## 16. 16. WELLNESS / BEAUTY – /wellness, /beauty
- [ ] Fitness tracker: workout log, kalórie.
- [ ] Nutrition: meal plan AI (5 kreditov).
- [ ] Meditation audio sessions (free + premium).
- [ ] Beauty: skincare routine builder, virtual try-on (AI).
- [ ] Booking spa/salon → Stripe deposit.

## 17. 17. COMMUNITY – /community/:id
- [ ] Vytvor komunitu (free/paid membership).
- [ ] Posts, events, bazaar scoped len pre members.
- [ ] Moderátori: pin, delete, ban.
- [ ] Paid membership cez Stripe subscription.

## 18. 18. MUSIC – /music
- [ ] Upload track (mp3/wav, max 50MB).
- [ ] Player s waveform, like/share/comment.
- [ ] Playlists vytvárať a zdieľať.
- [ ] Paid downloads (single track / album).
- [ ] Royalties dashboard.

## 19. 19. PROCLASS – /proclass
- [ ] Profesionálne workshopy (yoga, business, art).
- [ ] Booking + Stripe deposit.
- [ ] Reminder email 24h pred eventom.
- [ ] Cancel policy: full refund 48h+, 50% 24h, 0% < 24h.

## 20. 20. VACATIONER – /vacationer
- [ ] Browse cestovné balíčky.
- [ ] Filter destinácia, dátum, cena, počet osôb.
- [ ] Book → Stripe deposit, zvyšok pred odchodom.
- [ ] Bez Secret Santa modulu (over že chýba – memory rule).

## 21. 21. INVESTMENT – /investment
- [ ] Browse projekty na investovanie.
- [ ] Detail: ROI, risk score, dokumenty.
- [ ] Investovať → KYC + Stripe.
- [ ] Portfolio dashboard.

## 22. 22. REFERRAL – /referral
- [ ] Get my referral link, share buttons (FB, X, WhatsApp).
- [ ] Tracking: clicks, signups, conversions.
- [ ] Provízia: 10% z prvej platby pozvaného.
- [ ] Leaderboard top referrer.
- [ ] Fraud check: self-referral blokovaný.

## 23. 23. ADMIN – /admin/*
- [ ] Login len pre rolu 'admin' (cez has_role).
- [ ] Bazaar Trust – moderuj disputes.
- [ ] Brand Campaigns – schvaľuj kampane.
- [ ] Comedy/Influencer/MasterChef Payouts – release escrow.
- [ ] Corporate Inquiries – CRM B2B leads.
- [ ] Coupon Disputes – moderácia.
- [ ] IQ Analytics – KPI dashboard.
- [ ] Payment Dashboard – všetky transakcie, refundy.
- [ ] Platform Earnings – revenue per modul.
- [ ] Sports / Tipsters – moderácia.
- [ ] Transactions – ledger.
- [ ] Verifications – schvaľuj Verified badge.
- [ ] Withdrawals – schvaľuj výplaty.
- [ ] XP Audit / Reconciliation – over anomálie.

## 24. 24. CROSS-CUTTING – globálne
- [ ] 12 jazykov: prepni → UI text sa zmení, persistuje v localStorage.
- [ ] Default = English bez auto-detekcie browsera.
- [ ] EUR všade, žiadny USD/iný symbol.
- [ ] Glassmorphism: blur, transparentnosť, žiadne hard borders.
- [ ] Dark mode default, primary purple 270 91%, accent pink 330 100%.
- [ ] Mobile 360px: žiadny overflow, tap targets ≥ 44px.
- [ ] Realtime: 2 taby otvor → akcia v 1 sa prejaví v 2 do 2s.
- [ ] RLS: skús cudzie dáta cez priame URL → 403/redirect.
- [ ] Console: žiadne errors/warnings okrem 3rd-party.
- [ ] Network: žiadne 4xx/5xx (okrem zámerných testov).
- [ ] Lighthouse: Perf ≥ 80, A11y ≥ 90, SEO ≥ 90 (desktop).
- [ ] PWA install prompt, offline.html funguje.
- [ ] Push notifications (ak povolené).
- [ ] GDPR: /account/privacy → export dát, delete account (erasure).
- [ ] SEO: každá routa má unique title < 60ch, meta < 160ch, single H1, JSON-LD kde relevantné.
- [ ] Všetky sekcie 1–24 preklikané, bugy zapísané s routou + krokmi.
- [ ] Stripe end-to-end (kúpa, refund, webhook) funguje.
- [ ] Žiadne console errors / 4xx-5xx (okrem zámerných).
- [ ] Mobile 360px, tablet 768px, desktop 1440px – bez overflow.
- [ ] 12 jazykov prepínateľných, default EN.

## 25. 25. Anonymous Dating (mystical)
- [ ] /anonymous-dating: onboarding, vyber mask/avatara, súhlas 16+
- [ ] Vytvor profil bez mena/fotky — over RLS (anonymous_profiles view)
- [ ] Match flow: like/skip, daily limit reached → CTA upgrade
- [ ] Mystical reveal: po vzájomnom matchi → odkrytie identity (opt-in)
- [ ] Real-time chat (anonymous_messages): odoslať/prijať, presence
- [ ] Report/block partnera → moderation queue
- [ ] Stripe test: prémiový reveal coin balíček 4242 4242 4242 4242

## 26. 26. Blockchain Confessions
- [ ] /confessions: feed anonymných spovedí
- [ ] Vytvor confession → hash uložený, immutable check
- [ ] Reakcie (heart, hug, pray), counters real-time
- [ ] Search/filter podľa kategórie (relationships, work, family…)
- [ ] Moderation: trigger AI flag → admin queue

## 27. 27. Time Capsule & Time Reversal
- [ ] /time-capsule: vytvor kapsulu, nastav unlock date (future)
- [ ] Pridaj media (foto/video), recipientov (email/handle)
- [ ] Pokus o predčasné otvorenie → blocked s countdown
- [ ] /time-reversal: AI 'rewind' fotky — credit cost 5
- [ ] Zdielanie výsledku do Wall

## 28. 28. DNA & Reincarnation
- [ ] /dna: AI DNA insight kvíz, výsledok PDF export
- [ ] /reincarnation: 'past life' generátor — vyber éru, AI image+story
- [ ] Credit deduct 4, balance check
- [ ] Share to feed CTA

## 29. 29. Phobia & Dream Journal
- [ ] /phobia: vyber fóbiu, AI expozičná terapia (texty/scenáre)
- [ ] Progress tracker, denný streak
- [ ] /dream-journal: zapíš sen, AI interpretácia
- [ ] Pattern analytics týždeň/mesiac
- [ ] Export PDF

## 30. 30. Multiverse Network & Quantum
- [ ] /multiverse: vyber alternatívnu realitu, AI persona generator
- [ ] Cross-link s confessions/time-capsule
- [ ] /quantum-versions: porovnaj viaceré 'verzie seba'
- [ ] Holographic avatar hero video načítané (lazy)

## 31. 31. Property & Real Estate Hub
- [ ] /property: zoznam nehnuteľností, filter (cena, lokalita, m²)
- [ ] Detail listing — galéria, mapa, kontakt agent
- [ ] Vytvor listing (auth) → Stripe poplatok za inzerát
- [ ] Remotion video render z fotiek (PropertyVideo)
- [ ] Save to favorites, share

## 32. 32. Concert & Events
- [ ] /concert: nadchádzajúce akcie, filter mesto/dátum
- [ ] Kúpa lístka → Stripe checkout, QR ticket email
- [ ] Pridať do kalendára (calendarExport.ts)
- [ ] Organizátor: create event, sponsor tier

## 33. 33. Coloring Pages (Kids)
- [ ] /kids/coloring: vyber šablónu, canvas paint
- [ ] Save artwork, gallery zdielanie (rodičovský súhlas)
- [ ] AI generate nová šablóna — credit 3
- [ ] Parental Gate pri share/payment

## 34. 34. Virtual Pet & Pet Lover
- [ ] /virtual-pet: adopt pet, feeding/play/sleep cycle
- [ ] Decay logika (petDecay.ts) — 24h offline penalty
- [ ] Coins economy, shop items
- [ ] /pet-lover: real pet profile, vet tips, AI advisor

## 35. 35. Fashion Studio & Beauty
- [ ] /fashion-studio: AI outfit generator, save lookbook
- [ ] /beauty: tutorials, AI makeup try-on (5 credits)
- [ ] Booking salónu — Stripe deposit

## 36. 36. Nutrition & Fitness
- [ ] /nutrition: meal plan generator, makro tracker
- [ ] /fitness: workout builder, video reference
- [ ] Streak + XP integration
- [ ] AI coach chat — daily credit limit

## 37. 37. Tennis Arena & Sports
- [ ] /tennis-arena: match scheduling, leaderboard
- [ ] Bet/predict (sportCoins.ts) — kontrola limitov
- [ ] Live score updates real-time

## 38. 38. Brain Duel & IQ Challenge
- [ ] /brain-duel: vyzvi friend, real-time quiz
- [ ] IQ Challenge bets cross-user (escrow)
- [ ] Winner payout 90/10, history
- [ ] Achievements unlock

## 39. 39. Fairy Castles (Kids 6-12)
- [ ] /fairy-castles: build castle, story mode
- [ ] AI character interactions, COPPA-safe filter
- [ ] Parental gate pre in-app purchase

## 40. 40. Crystal Energy & Mystical Interactive
- [ ] /crystal-energy: vyber kryštál, AI energy reading
- [ ] Hero video načítaný (crystal-energy-hero.mp4)
- [ ] Buy crystal product → Stripe
- [ ] /mystical-interactive: tarot, numerológia, horoskop

## 41. 41. Holographic Checkout (UX)
- [ ] Akýkoľvek paid flow → over holografický checkout UI
- [ ] 3DS challenge (SCA) test karta 4000 0027 6000 3184
- [ ] Cancel / success redirect správny
- [ ] Receipt email + invoice PDF

## 42. 42. Sponsor Dashboard & Brand Arena Enterprise
- [ ] /sponsor: prihlás brand account, dashboard KPIs
- [ ] Branding persistence (logo, colors) — refresh check
- [ ] Enterprise API key generate, rate limit test
- [ ] Appeals workflow — submit, admin review, notify

## 43. 43. Edge Failure Modes
- [ ] Vypni sieť (DevTools offline) — offline.html sa zobrazí
- [ ] Edge function timeout → toast 'Skúste znova'
- [ ] Stripe webhook replay (idempotency)
- [ ] Rate limit prekročený → 429 handler

## 44. 44. Realtime & Presence
- [ ] Otvor 2 taby (rovnaký user) — presence sync
- [ ] DM typing indicator, read receipts
- [ ] Wall live new post badge
- [ ] Topic security: nepustí cudzí channel (RLS)

## 45. 45. Visual Regression & Mobile 360
- [ ] Mobile 360px viewport — žiadne horizontal scroll
- [ ] Tablet 768px, Desktop 1440px — layout check
- [ ] Dark mode toggle všade konzistentný
- [ ] Loading skeletony všade kde fetch

## 46. 46. Final Smoke — End-to-End User Journey
- [ ] Registrácia → onboarding → kúpa kreditov → AI tool use
- [ ] Post na Wall → reakcie → DM s iným userom
- [ ] Apply na job → employer comm → payment
- [ ] Join community → event → tip creator
- [ ] Logout → login → session restore
- [ ] GDPR export → erasure request

## 47. 47. Brand Battle & Sponzorské súboje
- [ ] Otvor /brand-battle – zobrazí sa zoznam aktívnych battlov.
- [ ] Klikni "Hlasovať" pri jednom brande – overí auth a uloží vote.
- [ ] Skús hlasovať druhýkrát – musí prísť toast "Už si hlasoval".
- [ ] Sponsor: klikni "Boost +100 hlasov" (3 kredity) – over odpočet v ledgeri.
- [ ] Skontroluj leaderboard – aktualizuje sa realtime.
- [ ] Otvor appeal flow – odošli odvolanie, sleduj status v Admin Brand Appeals.

## 48. 48. Brand Arena Enterprise
- [ ] Login ako Enterprise sponzor → /brand-arena/dashboard.
- [ ] Over branding upload (logo, farba, slogan) – persist po reload.
- [ ] API kľúče sekcia – generuj nový kľúč, skopíruj, revoke.
- [ ] Webhook URL – nastav, otestuj test event.
- [ ] Analytics: CTR, impressions, conversions za 7/30/90 dní.
- [ ] Export CSV – stiahni report, otvor v Exceli.

## 49. 49. Confessions (Anonymné spovede)
- [ ] /confessions – feed anonymných príspevkov, žiadne user_id viditeľné.
- [ ] Napíš spoveď (max 500 znakov) – AI moderácia musí prejsť.
- [ ] Skús vulgárny text – musí byť zablokované s hláškou.
- [ ] Reaguj emoji – počítadlo sa zvýši, RLS nedovolí spam.
- [ ] Report príspevok – ide do admin moderácie.
- [ ] Blockchain hash – over že každá spoveď má immutable hash.

## 50. 50. Time Capsule
- [ ] /time-capsule – vytvor kapsulu (text+foto), nastav dátum otvorenia >1 deň.
- [ ] Pred dátumom: musí byť locked s countdownom.
- [ ] Skús force-open cez devtools – RLS blokuje SELECT content.
- [ ] Po dátume: obsah sa zobrazí, notifikácia príde.
- [ ] Zdieľaj kapsulu link – iný user vidí len metadata.

## 51. 51. Time Reversal & DNA
- [ ] /time-reversal – AI nahrá staré foto, vygeneruj "mladšiu" verziu (5 kreditov).
- [ ] Over watermark a download možnosť.
- [ ] /dna-network – vyplň profil, AI nájde "DNA match" – sleduj odporúčania.
- [ ] Karmic Debt Tracker – zaznamenaj dlh, over checkbox UI.

## 52. 52. Reincarnation Hub
- [ ] /reincarnation – kvíz "Kto si bol v minulom živote" (8 otázok).
- [ ] Po dokončení AI report (4 kredity) – text + obrázok.
- [ ] Skontroluj Past Life Gallery – uložené reporty.
- [ ] Zdieľaj na Wall – post sa pridá s linkom.

## 53. 53. Phobia Journal & Dream Journal
- [ ] /phobia-journal – pridaj fóbiu, intenzitu 1-10, denník.
- [ ] AI insight (3 kredity) – odporúčania a coping techniques.
- [ ] /dream-journal – zapíš sen, AI interpret (3 kredity).
- [ ] Over kalendárny pohľad – streak countdown.

## 54. 54. Multiverse & Quantum
- [ ] /multiverse-network – vytvor "paralelnú verziu" profilu.
- [ ] Quantum chat: pošli správu medzi verziami, over routing.
- [ ] Realtime presence – druhá karta vidí "online".
- [ ] Verzie limit – over že FREE má max 1, PRO 5.

## 55. 55. Property & Real Estate Hub
- [ ] /property – filter ponúk (cena, lokácia, plocha, typ).
- [ ] Detail inzerátu – galéria, mapa, kontakt agent.
- [ ] Pridaj inzerát: photos upload, AI description (4 kredity).
- [ ] Saved searches – notifikácia pri novom matchi.
- [ ] Mortgage calculator – over výpočty.

## 56. 56. Concert & Events Hub
- [ ] /concert – kalendár eventov, filter žáner/mesto/dátum.
- [ ] Detail eventu – kúpa lístka (Stripe), QR ticket v emaile.
- [ ] Over že lístok je v "Moje lístky" sekcii.
- [ ] Refund cez admin – sleduj webhook.
- [ ] Pridaj event ako organizátor – schvaľovacie workflow.

## 57. 57. Tennis Arena
- [ ] /tennis – tréningový plán, vyber drill, sleduj progress.
- [ ] TacticsBoard – drag&drop; hráčov, ulož formáciu.
- [ ] TransferMarket – kúpa hráča za SportCoins.
- [ ] Match simulation – over BattlePower výpočet.
- [ ] Leaderboard týždenný – over reset v pondelok.

## 58. 58. Brain Duel & IQ Challenge
- [ ] /brain-duel – vyzvi friend cez DM, over notifikáciu.
- [ ] Live quiz – 10 otázok, timer, real-time skóre.
- [ ] IQ Challenge – platený vstup, prize pool.
- [ ] Bets cross-user – over že hráč nemôže staviť sám na seba.
- [ ] Achievements – odomkni badge, over v profile.

## 59. 59. Coloring Pages (Kids)
- [ ] /kids/coloring – vyber omaľovánku, paleta farieb.
- [ ] Save artwork – v galérii dieťaťa.
- [ ] Parental Gate – nákup novej sady (3 kredity).
- [ ] Print PDF – over kvalitu výstupu.

## 60. 60. Virtual Pet & Pet Lover
- [ ] /virtual-pet – vyber zviera, nakŕm/poláskaj.
- [ ] Decay system – po 24h hladu pet "sleeps".
- [ ] Pet shop – kúpa item za kredity.
- [ ] /pet-lover – komunita, foto súťaž, hlasovanie.

## 61. 61. Fashion Studio & Beauty
- [ ] /fashion-studio – AI outfit generátor (5 kreditov).
- [ ] Mood board – pridaj inšpirácie, share.
- [ ] /beauty – AI makeup try-on, before/after.
- [ ] Beauty shop – Stripe checkout, over shipping address.

## 62. 62. Nutrition & Fitness Hub
- [ ] /nutrition – denný plán, log meals, kalórie tracker.
- [ ] AI meal plan (5 kreditov) – 7-dňový rozpis.
- [ ] /fitness – workout video library, mark complete.
- [ ] Streak – over že chýbajúci deň reset.
- [ ] Body metrics – pridaj váhu, graf trendu.

## 63. 63. Wellness & Meditation
- [ ] /wellness – meditation player (audio), timer.
- [ ] Mood tracker – denný záznam, mesačný report.
- [ ] Breathing exercises – animácia + haptická vibrácia (mobile).
- [ ] Premium content lock – Stripe upgrade flow.

## 64. 64. Music Hub
- [ ] /music – player s playlistmi, like song.
- [ ] AI playlist generator (4 kredity) podľa nálady.
- [ ] Upload vlastnej skladby (creator) – moderácia + copyright check.
- [ ] Tip artist – P2P Tip Jar 10% provízia, over účtovanie.

## 65. 65. ProClass (Online kurzy)
- [ ] /proclass – katalóg kurzov, filter kategória/cena.
- [ ] Detail kurzu – preview lekcie zadarmo, kúpa Stripe.
- [ ] Po kúpe: prístup k všetkým lekciám, progress %.
- [ ] Certifikát po dokončení – PDF download.
- [ ] Q&A; s lektorom – sleduj DM thread.

## 66. 66. Vacationer Hub
- [ ] /vacationer – plánovač dovolenky, AI itinerár (5 kreditov).
- [ ] Booking integrácia – test linkov.
- [ ] Group trip – pozvi friends, split costs.
- [ ] Over že NIE JE Secret Santa modul (deprecated).

## 67. 67. Investment Hub
- [ ] /investment – portfolio dashboard, P/L grafy.
- [ ] Pridaj transakciu (manual), over výpočty.
- [ ] AI insights (5 kreditov) – risk analýza.
- [ ] Watchlist – realtime ceny (mock).
- [ ] Disclaimer "not financial advice" musí byť viditeľný.

## 68. 68. Crystal Energy & Mystical
- [ ] /crystal-energy – vyber kryštál, AI reading (3 kredity).
- [ ] Hologram intro video – over autoplay muted.
- [ ] Daily oracle – 1x denne free, ďalšie platené.
- [ ] Mystical shop – kúpa kryštálu, Stripe.

## 69. 69. Holographic Checkout UX
- [ ] Vyber ľubovoľný platený obsah → over holografický overlay.
- [ ] Stripe iframe – test 3DS challenge.
- [ ] Success → confetti animation + toast.
- [ ] Cancel → návrat na pôvodnú stránku, žiadne charge.
- [ ] Mobile 360x620 – over že modal scroll funguje.

## 70. 70. Final Smoke Test
- [ ] Logout → login → otvor 5 random hubov.
- [ ] Kúp 1 platený produkt – over webhook + ledger.
- [ ] Pošli 1 DM, prijmi notifikáciu (chime + push).
- [ ] Vytvor 1 Wall post – over realtime appearance.
- [ ] Cross-device: otvor v inom prehliadači – session sync.
- [ ] Skontroluj DevTools Console – žiadne red errors.
- [ ] Network tab – žiadne 4xx/5xx okrem očakávaných.

## 71. 71. Lucky Wheel & Daily Rewards
- [ ] Otvor /rewards – Lucky Wheel sa načíta, animácia plynulá.
- [ ] Spin – odpočet kreditov (1 spin/deň zadarmo, ďalšie za kredity).
- [ ] Výhra zobrazená v modal, pripísaná na účet (over v ledger).
- [ ] Streak counter sa zvýši; 7-day bonus vyplatený.
- [ ] Po vyčerpaní spinov – CTA na nákup kreditov.

## 72. 72. Weekly XP Leaderboard
- [ ] /leaderboard – top 100 používateľov, rebríček sa obnoví v pondelok 00:00 UTC.
- [ ] Vlastný rank zobrazený dole (sticky).
- [ ] Friends-only filter funguje.
- [ ] Odmena top 10 → automaticky pripísaná cez cron.

## 73. 73. Friend Quests & Challenges
- [ ] Pozvi priateľa na quest – notifikácia príde v reálnom čase.
- [ ] Spoločný quest progress sa synchronizuje.
- [ ] Odmena rozdelená 50/50 po dokončení.
- [ ] Cancel quest – refund čiastočný podľa progressu.

## 74. 74. Affiliate / Referral Program
- [ ] Skopíruj referral link z /affiliate – obsahuje tvoj kód.
- [ ] Nový user sa registruje cez link – pripísanie po prvej platbe.
- [ ] Tier progression (Bronze → Silver → Gold) funguje podľa MRR.
- [ ] Anti-fraud: rovnaké IP/device → flagged, nevypláca sa.
- [ ] Payout via Stripe Connect po dosiahnutí 50 EUR minima.

## 75. 75. Dunning & Failed Payments
- [ ] Vytvor subscription s test kartou 4000 0000 0000 0341 (decline po čase).
- [ ] Po failed charge – email + in-app notif (3 retry attempts).
- [ ] Grace period 3 dni → po vypršaní subscription paused.
- [ ] Update payment method link funguje.

## 76. 76. Winback Campaigns
- [ ] Cancel subscription – po 7 dňoch príde winback email so zľavou.
- [ ] Klik na CTA → /pricing s aplikovaným promo kódom.
- [ ] Re-subscribe – discount sa uplatní len raz.

## 77. 77. Subscription Pause & Resume
- [ ] Z /settings/subscription – pause na 1/2/3 mesiace.
- [ ] Počas pauzy: prístup zachovaný do konca obdobia, ďalej read-only.
- [ ] Resume manual alebo automatický po uplynutí.
- [ ] Limit: max 2 pauzy za rok.

## 78. 78. Tax & Invoicing
- [ ] Po platbe – PDF faktúra v /settings/billing.
- [ ] EU VAT reverse-charge pre B2B (VAT ID validácia cez VIES).
- [ ] Faktúra obsahuje: meno firmy, VAT ID, suma bez/s DPH, krajinu.
- [ ] Stiahnutie všetkých faktúr za rok – ZIP export.

## 79. 79. Multi-Currency Display
- [ ] Default EUR. Prepnúť v /settings/currency.
- [ ] Ceny prepočítané podľa denného kurzu (cron 06:00 UTC).
- [ ] Checkout vždy v EUR (server-side enforced).
- [ ] Historické platby zobrazené v pôvodnej mene.

## 80. 80. Cohort Retention Dashboard (Admin)
- [ ] /admin/analytics/cohorts – heatmapa D1, D7, D30 retention.
- [ ] Filter podľa acquisition channel.
- [ ] Export CSV funkčný.

## 81. 81. Subscription Analytics (Admin)
- [ ] MRR, ARR, churn rate, LTV – aktuálne čísla.
- [ ] Graf rastu za posledných 12 mesiacov.
- [ ] Breakdown podľa plánu.

## 82. 82. Stripe Disputes Handling
- [ ] Webhook charge.dispute.created → admin notif.
- [ ] /admin/disputes – list všetkých sporov so statusom.
- [ ] Submit evidence flow funguje.
- [ ] Pri prehre → automatický refund + user flagged.

## 83. 83. Creator KYC & Payouts
- [ ] Creator dashboard → KYC banner ak nedokončené.
- [ ] Stripe Connect onboarding link funguje.
- [ ] Po verifikácii: payout schedule (weekly default).
- [ ] Min payout 25 EUR, fees odpočítané.

## 84. 84. Megatalent Contest Periods
- [ ] Aktuálne kolo viditeľné s countdownom.
- [ ] Po ukončení: top 3 dostávajú výhry, 4-10 bonus kredity.
- [ ] Watch Party paywall – nedostupný free userom.
- [ ] 100k bonus votes pre verified founders.

## 85. 85. PWA Install & Offline
- [ ] Install prompt na mobile po 30s engagement.
- [ ] Po inštalácii: ikona na home screen, splash screen.
- [ ] Offline mode: /offline.html sa zobrazí, cached pages prístupné.
- [ ] Service worker update – toast s reload CTA.

## 86. 86. Web Vitals & Lighthouse
- [ ] LCP < 2.5s na homepage (mobile 4G).
- [ ] CLS < 0.1, INP < 200ms.
- [ ] Lighthouse Performance ≥ 85, SEO ≥ 95, A11y ≥ 90.
- [ ] Bundle size: main chunk < 250KB gzip.

## 87. 87. Security Scan & RLS Audit
- [ ] Spusti security--run_security_scan – žiadne high/critical findings.
- [ ] RLS audit test passing pre všetky public tabuľky.
- [ ] Žiadne secrets v repo (gitleaks scan).

## 88. 88. Free Tier Credit Matrix (Kids/Teen)
- [ ] Kids hub: 5 free AI kreditov denne (s parental gate).
- [ ] Teen hub: 10 free AI kreditov denne.
- [ ] Po vyčerpaní – paywall, žiadny upsell pre kids.

## 89. 89. Final End-to-End User Journey
- [ ] Sign up → onboarding → vyber hub → vytvor post → AI nástroj → checkout kreditov → spotreba.
- [ ] DM s iným userom → audio call → ukončenie.
- [ ] Subscribe na creator → konzumácia PPV obsahu.
- [ ] Cancel subscription → winback flow.
- [ ] Logout → re-login → state persisted.

## 90. 90. GDPR Erasure & Data Export
- [ ] Settings → Privacy → Request data export → JSON/ZIP doručený do 30 dní.
- [ ] Request account deletion → potvrdenie emailom → 30-day grace period.
- [ ] Po vymazaní: posts anonymizované, DMs odstránené, transactions zachované (legal).
- [ ] Audit log zachytí erasure event.

## 91. 91. Affiliate Tiers & Referral Leaderboard
- [ ] /referral → vidieť svoj tier (Bronze/Silver/Gold/Diamond) podľa počtu pozvaní.
- [ ] Komisia % rastie s tierom (napr. 10/15/20/25%).
- [ ] Leaderboard → top 10 referrerov za mesiac s avatarmi a počtami.
- [ ] Anti-fraud: rovnaký IP/device blokovaný.

## 92. 92. Activity Tracking & Analytics
- [ ] Posts, comments, likes, DMs tracked v activity_log.
- [ ] Profile → Activity tab zobrazí timeline posledných 30 dní.
- [ ] Admin dashboard → DAU/MAU/retention grafy.
- [ ] Inactivity reminder po 14 dňoch (email/push).

## 93. 93. Admin Engagement Tools
- [ ] /admin → push notification broadcast s segmentáciou (country, age, tier).
- [ ] Email campaign builder s preview a A/B testom.
- [ ] Featured content slot na homepage spravovaný adminom.

## 94. 94. AI Credits Policy & Throttling
- [ ] Free užívateľ: 0 creditov. Paid: monthly allocation podľa planu.
- [ ] Image gen = 5 credits, text gen = 3 credits, video = 20 credits.
- [ ] Po vyčerpaní → modal s ponukou top-up balíkov (EUR).
- [ ] Rate limit: max 10 AI requestov/min per user.

## 95. 95. Auto-Payout Cron
- [ ] Creator balance ≥ 50 EUR → automatický payout 1. v mesiaci cez Stripe Connect.
- [ ] Failed payout → email + retry po 3 dňoch.
- [ ] Admin sees cron run log v /admin/payouts.

## 96. 96. Bundle Size & Performance Budget
- [ ] Build → main bundle < 300 KB gzipped.
- [ ] Lighthouse CI fail ak performance < 80.
- [ ] Lazy-loaded routes pre všetky hub stránky.

## 97. 97. DM Consolidation
- [ ] Žiadne legacy /messages routy — všetko presmerované na /dm.
- [ ] Unified conversation list s search, mute, block.
- [ ] Realtime typing indicator a read receipts.

## 98. 98. I18N Completeness Audit
- [ ] Spusti scripts/i18n-check.mjs → 0 missing keys vo všetkých 12 jazykoch.
- [ ] Prepni jazyk → všetky labels preložené, žiadne raw keys.
- [ ] RTL jazyky (AR, HE) → layout sa zrkadlí.

## 99. 99. Profiles Views Consolidation
- [ ] public_profiles view → bezpečný subset (no email, no phone).
- [ ] RLS: anon vidí len verified profiles.
- [ ] Search používa GIN trigram index na display_name.

## 100. 100. Quantum Versions & Multiverse
- [ ] /multiverse → vytvor alternate version svojho profilu.
- [ ] Quantum coin flip → 50/50 outcome zaznamenaný v history.
- [ ] Cross-universe DM medzi verziami funguje.

## 101. 101. Realtime Presence Heartbeat
- [ ] Online indicator (green dot) sa aktualizuje každých 30s.
- [ ] Po zatvorení tabu → status offline do 60s.
- [ ] Presence channel limit: max 500 concurrent users per room.

## 102. 102. Referral Fraud Detection
- [ ] Self-referral (rovnaký email/IP) → blocked, no commission.
- [ ] Velocity check: > 10 signups z jednej IP/24h → flagged.
- [ ] Admin review queue pre suspicious referrals.

## 103. 103. Security Definer Functions Audit
- [ ] Všetky has_role, is_admin funkcie majú SECURITY DEFINER + search_path=public.
- [ ] Supabase linter → 0 SECURITY warnings.
- [ ] RLS testy v src/test/rls-audit.test.ts → all green.

## 104. 104. Social-Dating Audit Batch
- [ ] Anonymous dating profile → vidieť len mask, žiadne PII leaks.
- [ ] Match expiry: 7 dní bez interakcie → auto-archive.
- [ ] Refund window 24h pre paid matches.

## 105. 105. Final End-to-End Smoke (v7)
- [ ] Login → /referral → invite friend → friend signs up → commission credited.
- [ ] Settings → request data export → email arrives within 30 days.
- [ ] Switch language to AR → RTL layout OK → switch back to EN.
- [ ] AI tool use → credit deducted → top-up checkout → credits added.

## 106. 106. Brand Arena – Sponzorské úrovne
- [ ] Otvor /brand-arena – vidno 4 sponsor tiers (Bronze/Silver/Gold/Enterprise).
- [ ] Klikni na tier – zobrazí sa popis benefitov a cena v EUR.
- [ ] Enterprise tier vyžaduje admin schválenie (zobrazí formulár).
- [ ] Leaderboard zobrazuje top sponzorov s logom a počtom bodov.

## 107. 107. Priority Support SLA
- [ ] Prihlás sa ako Enterprise klient – v profile vidno 'Priority Support' badge.
- [ ] Vytvor support ticket – SLA timer beží (4h response).
- [ ] Admin dostane notifikáciu s prioritou 'high'.
- [ ] Po vyriešení sa SLA metrika zaznamená do admin dashboardu.

## 108. 108. Kids Channel – Parental Gate
- [ ] Otvor /kids – objaví sa Parental Gate (matematická otázka).
- [ ] Nesprávna odpoveď – prístup zamietnutý, redirect na /.
- [ ] Správna odpoveď – prístup povolený, uloží sa session token (24h).
- [ ] Skontroluj že žiadne platené tlačidlá nie sú viditeľné pre deti.

## 109. 109. Teen Hub – Vekové obmedzenia
- [ ] Otvor /teen – vyžaduje vek 13–17 v profile.
- [ ] Mladší user → redirect na /kids, starší → redirect na /.
- [ ] AI moduly majú obmedzený kredit (max 3/deň).
- [ ] Žiadny dating/explicit content nie je dostupný.

## 110. 110. Games Hub – GameDistribution
- [ ] Otvor /games – načítajú sa hry z GameDistribution API.
- [ ] Klikni na hru – otvorí sa iframe s reklamami.
- [ ] Pridaj hru do obľúbených – uloží sa do user_favorites.
- [ ] Skontroluj že hry sú filtrovateľné podľa kategórie a veku.

## 111. 111. Community Routes /community/:id
- [ ] Otvor /community/test-community – vidno community feed.
- [ ] Bazár scope – iba produkty z tejto komunity.
- [ ] Galéria scope – iba obrázky členov komunity.
- [ ] Non-member vidí preview, ale nemôže postovať.

## 112. 112. DM Unification – Žiadne legacy
- [ ] Otvor /messages – iba unified conversation model.
- [ ] Skontroluj že staré /chat routy redirectujú na /messages.
- [ ] Pošli správu – objaví sa v conversations table, nie v messages_legacy.
- [ ] Mute conversation – overený RLS scope.

## 113. 113. Confessions – Limity
- [ ] Otvor /confessions – vidno feed anonymných príspevkov.
- [ ] Vytvor confession – max 5/deň pre free user.
- [ ] Po prekročení limitu – zobrazí sa upgrade modal.
- [ ] Anonymný feed – žiadne PII (mená, foto) nie sú vidno.
- [ ] Kúp ľubovoľný credit pack – v profile vidno 'Refund' tlačidlo.
- [ ] Klikni Refund do 24h – Stripe refund prebehne, kredity sa odoberú.
- [ ] Po 24h – tlačidlo zmizne, refund len cez support.
- [ ] Refund záznam sa zobrazí v admin dashboarde.

## 115. 115. Tip Jar – 10% provízia
- [ ] Otvor profil tvorcu – klikni 'Tip'.
- [ ] Pošli 10€ tip – Stripe Connect transfer: 9€ tvorcovi, 1€ platforme.
- [ ] Notifikácia príde tvorcovi v real-time.
- [ ] Tip sa zobrazí v ledger transactions (typ: 'tip').

## 116. 116. Fairy Castles – Dievčenský hub
- [ ] Otvor /fairy-castles – vidno ružovo-fialový dizajn s glassmorphism.
- [ ] Mini-hry sa načítajú a sú hrateľné.
- [ ] Kredity sa odpočítavajú správne (3-5 per AI nástroj).
- [ ] Žiadne nevhodné content (filter pre vek 6–12).

## 117. 117. KitchenStars Arena
- [ ] Otvor /kitchenstars-arena – vidno rebríček kuchárov.
- [ ] Submit recept – uloží sa s fotkou a ingredienciami.
- [ ] Hlasovanie funguje (1 hlas / user / deň).
- [ ] Top 3 dostávajú XP bonus na konci týždňa.

## 118. 118. ProClass – Profesionálne kurzy
- [ ] Otvor /proclass – vidno katalóg kurzov.
- [ ] Kúp kurz cez Stripe – prístup sa odomkne okamžite.
- [ ] Video lekcie sa streamujú (HLS).
- [ ] Certifikát sa vygeneruje po dokončení 100%.

## 119. 119. Brand Collaboration Escrow
- [ ] Brand vytvorí kampaň – nastaví budget v EUR.
- [ ] Funds idú do Stripe escrow (nie priamo creator).
- [ ] Creator submituje deliverable – brand schváli.
- [ ] Po schválení: 80% creator, 20% platforma (Stripe Connect transfer).

## 120. 120. Megatalent – Watch Party
- [ ] Otvor /megatalent počas live event.
- [ ] Watch Party paywall – kúp prístup za 5€.
- [ ] Real-time chat funguje (Supabase Realtime).
- [ ] 100k bonus hlasov sa pripíše top performerovi.

## 121. 121. Lucky Wheel – Daily Spin
- [ ] Otvor /rewards – klikni 'Spin Wheel' (1x denne zdarma).
- [ ] Wheel sa animuje a zastaví na náhodnej cene.
- [ ] Odmena sa pripíše do ledger (XP, kredity, alebo bonus).
- [ ] Cooldown 24h – ďalší spin zablokovaný.

## 122. 122. Final Smoke v8
- [ ] Otestuj všetky kritické routy: /, /messages, /rewards, /megatalent, /brand-arena.
- [ ] Skontroluj že nie sú console errors v DevTools.
- [ ] Lighthouse score > 85 na hlavnej stránke.
- [ ] Stripe webhook reconciliation prebehol bez chýb (admin dashboard).

## 123. 123. Lokalizácia – 12 jazykov
- [ ] Otvor language selector v hlavičke – vidno 12 jazykov.
- [ ] Prepni na slovenčinu – UI sa preloží okamžite, bez reloadu.
- [ ] Voľba sa uloží do localStorage (i18nextLng).
- [ ] Reload stránky – jazyk zostane zachovaný.
- [ ] Default po prvom načítaní je angličtina (žiadna auto-detekcia).

## 124. 124. Currency – iba EUR
- [ ] Skontroluj všetky ceny v aplikácii – iba symbol €.
- [ ] Žiadne USD/CZK/PLN nikde nie sú zobrazené.
- [ ] Stripe checkout vždy v EUR.
- [ ] Server-side currency lock – API odmietne iný menový kód.

## 125. 125. Age Rating 16+
- [ ] Registrácia – vyžaduje dátum narodenia, vek < 16 zamietnutý.
- [ ] Hlavná platforma je označená '16+' v footer.
- [ ] Kids Channel je oddelený a má '6–12' label.
- [ ] Žiadny zdravotný claim nie je v UI (regulačné dôvody).

## 126. 126. GDPR – Erasure & Export
- [ ] Otvor /settings/privacy – vidno 'Export my data' a 'Delete account'.
- [ ] Klikni Export – príde email so ZIP archívom (JSON dump).
- [ ] Klikni Delete – 30-dňový grace period, potom hard delete.
- [ ] Po delete – všetky PII anonymizované (user_xxx placeholder).

## 127. 127. AI Credits – Throttling
- [ ] Vyčerpaj denný kredit (napr. 50/deň free).
- [ ] Ďalšie volanie AI – HTTP 429 s upgrade modalom.
- [ ] Throttle counter sa resetuje o polnoci UTC.
- [ ] Paid user má vyšší limit (200/deň) – overené v ledger.

## 128. 128. Affiliate Tiers & Leaderboard
- [ ] Otvor /affiliate – vidno svoj tier (Bronze/Silver/Gold).
- [ ] Pozvánkový link funguje – nový user sa pripíše k referrerovi.
- [ ] Leaderboard zobrazuje top 100 affiliates.
- [ ] Komisia: 20% z prvej platby referee, kreditovaná do ledger.

## 129. 129. Referral Fraud Detection
- [ ] Skús self-referral (rovnaký device/IP) – zablokované.
- [ ] Vytvor 5+ accountov z jednej IP – flagnuté ako podozrivé.
- [ ] Admin dashboard zobrazí fraud signály.
- [ ] Manuálne schválenie/zamietnutie komisií funguje.

## 130. 130. Dunning – Failed Payments
- [ ] Použi test card 4000 0000 0000 0341 (decline po auth).
- [ ] Subscription zlyhá – Stripe webhook spustí dunning email.
- [ ] 3 pokusy v intervaloch 1/3/7 dní.
- [ ] Po neúspechu – subscription zmrazený, prístup obmedzený.

## 131. 131. Winback Campaign
- [ ] Cancel subscription – po 7 dňoch príde winback email s 30% zľavou.
- [ ] Klikni link – Stripe checkout s coupon kódom.
- [ ] Po reaktivácii – pôvodné dáta a kredity sa obnovia.
- [ ] Winback metrika sa zobrazí v admin analytics.

## 132. 132. Subscription Pause & Resume
- [ ] Otvor /billing – klikni 'Pause subscription' (max 3 mesiace).
- [ ] Subscription paused → prístup obmedzený, žiadne accruals.
- [ ] Resume kedykoľvek – obnoví sa billing cycle.
- [ ] Po 3 mesiacoch auto-resume alebo cancel.

## 133. 133. Tax & Invoicing
- [ ] Doplň fakturačné údaje (firma, IČO, DIČ).
- [ ] Po platbe príde PDF faktúra emailom.
- [ ] Faktúra obsahuje VAT (20% SK) ak je EU non-business.
- [ ] B2B reverse-charge – VAT = 0% s poznámkou.

## 134. 134. Subscription Analytics
- [ ] Otvor admin /analytics/subscriptions.
- [ ] Vidno MRR, ARR, churn rate, LTV.
- [ ] Cohort retention table – zobrazuje % retencie po 1/3/6 mesiacoch.
- [ ] Export do CSV funguje.

## 135. 135. Stripe Disputes
- [ ] Simuluj dispute cez Stripe Dashboard.
- [ ] Webhook stripe.charge.dispute.created spustí admin alert.
- [ ] Admin môže nahrať dôkazy cez UI.
- [ ] Stav disputu sa zobrazí v user profile (badge).

## 136. 136. Creator KYC & Payouts
- [ ] Tvorca prejde Stripe Connect onboarding (Express).
- [ ] KYC documents nahrané – stav 'pending' → 'verified'.
- [ ] Po verify – môže prijímať payouts (auto týždenne).
- [ ] Payout history vidno v /creator/earnings.

## 137. 137. PWA Install & Offline
- [ ] V Chrome mobile – 'Add to Home Screen' prompt sa zobrazí.
- [ ] Po inštalácii – ikona na home screen, otvára sa standalone.
- [ ] Offline mode – načíta sa /offline.html stránka.
- [ ] Service worker cache funguje (static assets).

## 138. 138. Web Vitals & Lighthouse
- [ ] Spusti Lighthouse na /, /megatalent, /brand-arena.
- [ ] Performance > 85, Accessibility > 90, SEO > 95.
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms.
- [ ] Web vitals sa logujú do analytics (webVitals.ts).

## 139. 139. Security Scan & RLS Audit
- [ ] Spusti supabase linter – žiadne security_definer_view warnings.
- [ ] Všetky public tabuľky majú RLS enabled.
- [ ] user_roles tabuľka – iba has_role() function má prístup.
- [ ] Žiadne service_role kľúče v client kóde.

## 140. 140. Final E2E User Journey v9
- [ ] Signup → email verify → onboarding → profile complete.
- [ ] Buy credit pack → spend on AI tool → check ledger.
- [ ] Subscribe to creator → send DM → tip 5€.
- [ ] Cancel subscription → receive winback email → resubscribe with coupon.
- [ ] Delete account → verify anonymization po 30 dňoch.

## 141. 141. Cohort Retention Dashboard
- [ ] Otvor /admin/analytics/cohorts ako admin
- [ ] Skontroluj D1/D7/D30 retention pre posledných 8 týždňov
- [ ] Over export do CSV (správne stĺpce: cohort_week, d1, d7, d30, n)
- [ ] Skontroluj graf — bez NaN/Infinity hodnôt

## 142. 142. Weekly XP Leaderboard
- [ ] Otvor /leaderboard/xp
- [ ] Over Top 100 zoradenie podľa weekly_xp DESC
- [ ] Skontroluj reset každý pondelok 00:00 UTC (cron job)
- [ ] Klikni na profil hráča → správny redirect na /u/:handle

## 143. 143. Multi-Currency Display Lock
- [ ] Prepni currency v UI (mal by zostať EUR)
- [ ] Skontroluj že checkout vytvára Stripe session vždy v EUR
- [ ] Over že žiadne USD/GBP nie sú v Stripe Dashboard za posledný týždeň

## 144. 144. SCA / 3DS Challenge
- [ ] Použi test kartu 4000 0027 6000 3184
- [ ] Vyplň 3DS challenge (heslo: any)
- [ ] Over úspešný redirect späť do app s session_id
- [ ] Skontroluj že payment_intent.status = succeeded

## 145. 145. Stripe Webhook Reliability
- [ ] Otvor Stripe Dashboard → Webhooks → events
- [ ] Over že posledných 100 eventov má status 200
- [ ] Skontroluj retry logiku pre failed eventy (max 3x)
- [ ] Pozri sa do edge function logs pre stripe-webhook

## 146. 146. Reconciliation Daily Job
- [ ] Spusti supabase functions invoke daily-reconciliation
- [ ] Over že all_orders.paid_amount == sum(stripe charges)
- [ ] Skontroluj report v /admin/reconciliation
- [ ] Žiadne discrepancies > 0.01 EUR

## 147. 147. Free Tier Removal Verification
- [ ] Skús pristúpiť ku ktorémukoľvek hub bez subscription
- [ ] Over redirect na /pricing alebo paywall
- [ ] Skontroluj že žiadny endpoint nevracia obsah bez aktívneho predplatného
- [ ] Test pre 5 náhodných hubov

## 148. 148. One-Off Payment Router
- [ ] Skús kúpiť kredity (one-off), megatalent vote (one-off), tip (one-off)
- [ ] Over že každý vytvára správny Stripe checkout mode=payment
- [ ] Po úspechu sa kredity/votes pripíšu okamžite (webhook)

## 149. 149. Megatalent Subscription Split (80/20)
- [ ] Tvorca dostane subscription € 10
- [ ] Over že 8 EUR ide na connected account, 2 EUR platforma
- [ ] Skontroluj v Stripe Connect → Transfers

## 150. 150. Megatalent Contest Periods
- [ ] Over že aktuálny contest má správny start/end (týždeň pondelok–nedeľa)
- [ ] Po skončení sa automaticky vyhlási víťaz (cron)
- [ ] Bonus 100k votes sa pripíše víťazovi do 24h

## 151. 151. Referral Payout Eligibility
- [ ] Vytvor referral kód, pošli kamarátovi, ten kúpi subscription
- [ ] Over že referrer dostane bonus až po 30 dňoch (refund window)
- [ ] Skontroluj /referrals dashboard

## 152. 152. Admin Stripe Refund Flow
- [ ] Otvor /admin/orders, vyber order
- [ ] Klikni Refund → potvrď
- [ ] Over Stripe refund created + email notifikácia kupujúcemu
- [ ] Order status = refunded

## 153. 153. Kids/Teen AI Credit Matrix
- [ ] Prihlás sa ako kids účet (vek < 13)
- [ ] Skús použiť AI tool → cena 1 kredit (nie 3-5 ako u dospelých)
- [ ] Prihlás sa ako teen (13-17) → cena 2 kredity
- [ ] Adult → 3-5 kreditov

## 154. 154. Subscription Lifecycle Events
- [ ] Vytvor subscription, pauznú, resume, cancel
- [ ] Over že každý event vytvorí záznam v subscription_events tabuľke
- [ ] Email notifikácie odoslané pre každý event

## 155. 155. Subscription Pause Limits
- [ ] Pauzni subscription na 3 mesiace (max)
- [ ] Skús pauznúť na 4 mesiace → error
- [ ] Over že počas pauzy nie je účtované

## 156. 156. Realtime Topic Security
- [ ] Otvor 2 browser tabs s rôznymi userami
- [ ] User A subscribuje na svoj topic (user_id:A)
- [ ] User B sa skúsi subscribovať na topic user_id:A → RLS blokuje

## 157. 157. Final Smoke v10
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Otvor 10 random hubov, skontroluj že žiaden nehodí 404/500
- [ ] Skús 1 checkout flow end-to-end (kredity)
- [ ] Skontroluj že notifications zvonček funguje

## 158. 158. Brain Duel Cross-User
- [ ] User A vyzve User B na Brain Duel
- [ ] Over notifikáciu u User B v reálnom čase
- [ ] Obaja hrajú, výsledok sa zapíše do brain_duel_results
- [ ] XP/credits pripísané obom správne

## 159. 159. Friend Quest Invite & Response
- [ ] Pošli Friend Quest invite
- [ ] Over notifikáciu (chime + badge)
- [ ] Accept → quest sa vytvorí pre oboch
- [ ] Decline → invite zmazaný, notifikácia odoslaná

## 160. 160. IQ Challenge Bets Cross-User
- [ ] Vytvor IQ challenge s bet (10 kreditov)
- [ ] Druhý user accepts bet → kredity escrow
- [ ] Výhra → víťaz dostane 20 kreditov, prehra → 0

## 161. 161. Jobs Employer Cycle
- [ ] Zaregistruj sa ako employer
- [ ] Publikuj job (€ 5 platba)
- [ ] Over že sa zobrazí v /jobs feed a sitemap-jobs.xml
- [ ] Kandidát aplikuje → notifikácia employerovi

## 162. 162. Megatalent D5 Smoke
- [ ] Otvor /megatalent
- [ ] Skontroluj že D5 (Day 5) contest beží
- [ ] Vote × 1 (1 credit), watch party live count > 0

## 163. 163. Megatalent Payment Flow Top
- [ ] Klikni Vote Top → Stripe checkout
- [ ] Použi 4242 4242 4242 4242
- [ ] Po success: votes pripísané, redirect na /megatalent?success=true

## 164. 164. Megatalent Payment Cancel
- [ ] Spusti Vote checkout, klikni Cancel
- [ ] Redirect na /megatalent?canceled=true
- [ ] Žiadne votes pripísané, žiadne charge

## 165. 165. Megatalent Unlocked Content
- [ ] Bez subscription: Watch Party paywall
- [ ] Po subscription: prístup k full stream + chat

## 166. 166. Megatalent Watch Party Paywall
- [ ] Otvor live watch party bez ticketu
- [ ] Over paywall modal s CTA Buy ticket (€ 2)
- [ ] Po platbe: instant prístup

## 167. 167. Notification Chime Autoplay
- [ ] Otvor app v novom tabe (no user interaction)
- [ ] Pošli si notifikáciu z druhého tabu
- [ ] Over že chime sa NEspustí (autoplay block), banner sa zobrazí
- [ ] Po click anywhere → chime funguje

## 168. 168. Sponsor Dashboard Branding
- [ ] Login ako sponsor
- [ ] Upload logo, nastav primary color
- [ ] Over že branding sa zachová po reload (persistence)
- [ ] Enterprise API key → test endpoint /api/sponsor/stats

## 169. 169. Wall Buttons All
- [ ] Otvor /wall
- [ ] Like, Comment, Share, Bookmark, Report — všetky funkčné
- [ ] Over že counters sa updatujú v reálnom čase

## 170. 170. Wall Groups
- [ ] Vytvor group post
- [ ] Over visibility = members only (RLS)
- [ ] Non-member nevidí post v /wall

## 171. 171. Wall Seeded Like/Bookmark
- [ ] Seed: 10 posts s 5 likes každý
- [ ] Over že počet likes je správne načítaný (nie N+1 query)
- [ ] Bookmark → zobrazí sa v /bookmarks

## 172. 172. Wall User Journey
- [ ] Nový user: register → onboarding → first post → first like → first comment
- [ ] Over že každý krok má analytics event

## 173. 173. Credits Ledger Integrity
- [ ] Otvor /credits/history
- [ ] Over že sum(credits_delta) == current_balance
- [ ] Žiadne duplicate entries pre rovnaký transaction_id

## 174. 174. Session Smoke
- [ ] Login → refresh page → stále prihlásený
- [ ] Close tab, reopen → session persists (max 7 days)
- [ ] Logout → redirect na /login, žiadny chránený obsah

## 175. 175. Final E2E v11
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Plný flow: register → buy credits → use AI tool → post wall → message DM → logout
- [ ] Žiadne console errors, žiadne 4xx/5xx network requests

## 176. 176. Anonymous Dating Profiles RLS
- [ ] Vytvor anonymous dating profile
- [ ] Over že feed neukáže real_name ani email (iba alias)
- [ ] RLS: iný user nedostane prístup k owner_user_id cez API

## 177. 177. Anonymous Date Matches
- [ ] Swipe right na profil
- [ ] Vzájomný match → notifikácia obom
- [ ] Chat sa otvorí v anonymous mode (žiadne real identity)

## 178. 178. Dating Checkout Contract
- [ ] Otvor /dating/premium
- [ ] Klikni Subscribe → správny price_id v Stripe session
- [ ] Po success: dating_premium flag = true v profile

## 179. 179. Coloring Pages (Kids)
- [ ] Otvor /kids/coloring
- [ ] Parental Gate (math captcha)
- [ ] Vyber obrázok, použi paint tool, save
- [ ] Saved image v /kids/gallery

## 180. 180. DNA Buttons
- [ ] Otvor /dna
- [ ] Klikni všetky CTA buttons (Analyze, Match, Compare)
- [ ] Žiadny dead link, všetky vedú na funkčné stránky

## 181. 181. Education Smoke
- [ ] Otvor /education
- [ ] Vyber kurz, spusti lesson, complete quiz
- [ ] XP pripísané, progress bar updated

## 182. 182. English Language Audit
- [ ] Prepni jazyk na English
- [ ] Otvor 5 random hubov
- [ ] Žiadne untranslated keys (žiadne 'common.xxx' raw strings)

## 183. 183. Fairy Castles
- [ ] Otvor /fairy-castles
- [ ] Build castle (drag & drop)
- [ ] Save → zobrazí sa v gallery
- [ ] Share button funguje (copy link)

## 184. 184. Health & Wellness Smoke
- [ ] Otvor /health
- [ ] Track workout, log meal, mood entry
- [ ] Dashboard zobrazí dnešné dáta

## 185. 185. Holographic Checkout
- [ ] Otvor holographic avatar checkout
- [ ] Stripe flow, success redirect
- [ ] Avatar unlocked v profile

## 186. 186. Kids Channel Smoke
- [ ] Otvor /kids
- [ ] Parental Gate pred entry
- [ ] Žiadny adult content prístupný
- [ ] Age-appropriate UI (large buttons, bright colors)

## 187. 187. Mobile 360 Viewport
- [ ] Nastav viewport 360x640
- [ ] Skontroluj všetky hlavné routes — žiadny horizontal scroll
- [ ] Touch targets ≥ 44x44 px

## 188. 188. Multiverse Network
- [ ] Otvor /multiverse
- [ ] Quantum version switcher funguje
- [ ] Network graph render bez WebGL errors

## 189. 189. Mystical Interactive
- [ ] Otvor /mystical
- [ ] Tarot draw, horoscope, dream interpreter
- [ ] AI response < 5s, kredity decreased

## 190. 190. Not Found / 404
- [ ] Naviguj na /this-does-not-exist
- [ ] Over custom 404 page s linkom späť na home
- [ ] Žiadny blank screen

## 191. 191. SEO Jobs Sitemap
- [ ] Otvor /sitemap-jobs.xml
- [ ] Over že obsahuje aktívne job postings
- [ ] Valid XML, < 50MB, < 50k URLs

## 192. 192. Tennis Arena Buttons
- [ ] Otvor /tennis-arena
- [ ] Všetky CTA fungujú (Join Tournament, Buy Equipment, Watch Live)

## 193. 193. Vacationer No Secret Santa
- [ ] Vytvor vacationer profile
- [ ] Over že Secret Santa module NIE JE viditeľný (off-season alebo vypnutý)

## 194. 194. Visual Regression
- [ ] Spusti e2e/authed/visual-regression.spec.ts
- [ ] Žiadne snapshot diffs > 0.1% pixel difference

## 195. 195. Final E2E v12
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Cross-feature flow: dating swipe → match → DM → tip → premium upgrade
- [ ] Žiadne errors v console / network

## 196. 196. Brand Battle Sponsor
- [ ] Login ako sponsor brand
- [ ] Vytvor Brand Battle s budget € 100
- [ ] Over že súťažiaci dostávajú notifikácie
- [ ] Voting period beží správne (start/end dates)

## 197. 197. Brand Battle Voting
- [ ] Hlasuj v Brand Battle (1 vote = 1 credit)
- [ ] Over že vote sa pripočíta okamžite
- [ ] Leaderboard sa updatuje real-time

## 198. 198. Brand Appeals & Notifications
- [ ] Brand dostane moderation strike
- [ ] Podá appeal cez /brand/appeals
- [ ] Admin notifikácia odoslaná
- [ ] Po rozhodnutí: brand dostane email + in-app notif

## 199. 199. Brand Moderation
- [ ] Otvor /admin/brand-moderation
- [ ] Review pending posts, approve/reject
- [ ] Rejected post zmizne z public feed do 1 min

## 200. 200. Brand Arena Enterprise API
- [ ] Generate Enterprise API key v sponsor dashboard
- [ ] GET /api/sponsor/stats s Bearer token
- [ ] Over rate limit (100 req/min)
- [ ] Invalid key → 401

## 201. 201. Confessions Limit
- [ ] Postuj 5 confessions za deň
- [ ] 6. pokus → error 'Daily limit reached'
- [ ] Reset o 00:00 UTC

## 202. 202. Rewards Claim
- [ ] Otvor /rewards
- [ ] Claim daily reward (XP + credits)
- [ ] Over že druhý claim v ten istý deň zlyhá

## 203. 203. Rewards Lucky Wheel
- [ ] Otvor Lucky Wheel
- [ ] Spin (1x denne free)
- [ ] Reward pripísaný (animation + toast)
- [ ] Druhý spin → paywall (10 credits)

## 204. 204. Rewards Load Test
- [ ] 10 súbežných userov claim reward súčasne
- [ ] Žiadny double-claim, ledger konzistentný

## 205. 205. AI Credits Store
- [ ] Otvor /credits/buy
- [ ] Vyber bundle (100 / 500 / 1000)
- [ ] Stripe checkout, success → credits okamžite pripísané

## 206. 206. AI Credits Throttling
- [ ] Spusti 20 AI requests za 10s
- [ ] Over rate limit response 429 po prekročení
- [ ] Reset po 60s

## 207. 207. Buttons Smoke
- [ ] Spusti e2e/buttons.spec.ts
- [ ] Žiadny dead button v primary navigation
- [ ] Všetky CTA majú aria-label

## 208. 208. Journey Smoke
- [ ] Spusti e2e/journey.spec.ts (full user journey)
- [ ] Register → onboard → first action → conversion → retention day 2
- [ ] Žiadny krok nezlyhá

## 209. 209. SEO Validate Script
- [ ] Spusti node scripts/validate-seo.mjs
- [ ] Žiadne missing meta descriptions
- [ ] Všetky pages majú canonical URL
- [ ] JSON-LD valid (schema.org)

## 210. 210. I18N Check Script
- [ ] Spusti node scripts/i18n-check.mjs
- [ ] Žiadne missing keys vo všetkých 12 jazykoch
- [ ] Žiadne unused keys (warning OK)

## 211. 211. Bundle Size Report
- [ ] Spusti node scripts/bundle-report.mjs
- [ ] Main bundle < 500 KB gzipped
- [ ] Žiadny chunk > 1 MB
- [ ] Lazy chunks pre routes

## 212. 212. Routes Check
- [ ] Spusti node scripts/check-routes.mjs
- [ ] Všetky routes v App.tsx majú komponent
- [ ] Žiadne duplicate routes

## 213. 213. Lighthouse CI
- [ ] Spusti npm run lighthouse
- [ ] Performance ≥ 80
- [ ] Accessibility ≥ 95
- [ ] SEO = 100
- [ ] Best Practices ≥ 90

## 214. 214. CI Workflow Green
- [ ] Otvor .github/workflows na GitHub
- [ ] Posledný commit: ci.yml ✓, e2e.yml ✓, lighthouse.yml ✓
- [ ] Žiadne flaky tests (retry > 0)

## 215. 215. Final E2E v13
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Kompletný marketing → conversion funnel
- [ ] Landing → pricing → checkout → onboarding → first value
- [ ] Time-to-value < 3 min

## 216. 216. Push Notifications Subscribe
- [ ] Otvor app v Chrome/Edge
- [ ] Allow push notifications prompt
- [ ] Over že subscription je uložená v push_subscriptions tabuľke
- [ ] Test push: admin pošle test notif → zobrazí sa OS notifikácia

## 217. 217. Service Worker Update
- [ ] Deploy novej verzie
- [ ] Otvor app → SW detekuje update
- [ ] Toast 'New version available, reload?' sa zobrazí
- [ ] Po reload nová verzia aktívna

## 218. 218. Offline Mode
- [ ] Otvor app, načítaj home
- [ ] Vypni internet (DevTools → offline)
- [ ] Naviguj na cached route → funguje
- [ ] Naviguj na nový route → zobrazí offline.html

## 219. 219. PWA Install Prompt
- [ ] Splni install criteria (manifest + SW + HTTPS)
- [ ] Custom install banner sa zobrazí po 30s
- [ ] Klikni Install → app pridaná na home screen
- [ ] Open ako standalone window

## 220. 220. Profile Cache Invalidation
- [ ] Otvor profil, uprav meno
- [ ] Over že cache (profileCache.ts) je invalidovaná
- [ ] Iný komponent zobrazí nové meno bez reload

## 221. 221. Storage Signed URLs
- [ ] Upload file do Supabase Storage (private bucket)
- [ ] Generate signed URL (expires 1h)
- [ ] Access cez signed URL → 200
- [ ] Po expiry → 403

## 222. 222. PII Masking
- [ ] Spusti vitest src/test/pii-masking.test.ts
- [ ] Over že emails, phone, IBAN sú maskované v logs
- [ ] Žiadne plaintext PII v Sentry/console

## 223. 223. Sanitize HTML
- [ ] User input s alert(1)
- [ ] Render → žiadne XSS execution
- [ ] Allowed tags: p, br, strong, em, a (rel=nofollow)

## 224. 224. Rate Limit Utils
- [ ] Spusti vitest src/utils/rateLimit.test.ts
- [ ] Token bucket: 10 req/min limit dodržaný
- [ ] Reset po expiry window

## 225. 225. Error Handler
- [ ] Spusti vitest src/utils/errorHandler.test.ts
- [ ] Network error → user-friendly toast
- [ ] Auth error → redirect na /login
- [ ] Unknown error → generic message + Sentry log

## 226. 226. Safe Invoke (Edge Functions)
- [ ] Spusti vitest src/utils/safeInvoke.test.ts
- [ ] Retry on 5xx (max 3x exponential backoff)
- [ ] Timeout 10s
- [ ] Žiadny crash na network failure

## 227. 227. Logger Levels
- [ ] Spusti vitest src/utils/logger.test.ts
- [ ] Production: iba error + warn
- [ ] Development: všetky úrovne
- [ ] Žiadne console.log v production bundle

## 228. 228. Image Performance
- [ ] Otvor /index, skontroluj Network tab
- [ ] Všetky images < 200KB
- [ ] Lazy loading (loading=lazy)
- [ ] Modern formats (webp/avif) served

## 229. 229. Image Upload Prep
- [ ] Upload 5MB JPG
- [ ] Klient resize na max 1920px width
- [ ] Komprese quality 85%
- [ ] Final size < 500KB

## 230. 230. Lazy Fonts
- [ ] Otvor app v cold cache
- [ ] Fonts loaded async (font-display: swap)
- [ ] Žiadny FOIT (flash of invisible text)

## 231. 231. Lazy With Retry
- [ ] Simuluj failed chunk load (DevTools throttling)
- [ ] Komponent retry 3x
- [ ] Po 3 failoch → error boundary fallback UI

## 232. 232. Web Vitals Tracking
- [ ] Otvor app, scroll, interact
- [ ] Over že LCP, FID, CLS, INP sa odošlú do analytics
- [ ] Žiadne metric > threshold (LCP < 2.5s, CLS < 0.1)

## 233. 233. Accessibility (a11y)
- [ ] Spusti axe DevTools na 5 hlavných routes
- [ ] Žiadne critical/serious violations
- [ ] Keyboard navigation funkčná (Tab, Enter, Esc)
- [ ] Screen reader (NVDA/VoiceOver) prejde formulárom

## 234. 234. RTL Support
- [ ] Prepni jazyk na Arabic (alebo Hebrew)
- [ ] Over dir=rtl na html elemente
- [ ] Layout zrkadlený správne (icons, alignment)

## 235. 235. Final E2E v14
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Performance audit: cold load < 3s na 4G
- [ ] Žiadne layout shift po load
- [ ] Všetky CTA above the fold viditeľné

## 236. 236. Auth: Email Signup
- [ ] Otvor /signup, vyplň email + password (min 8 znakov)
- [ ] Confirmation email doručený do 1 min
- [ ] Klikni link → account aktivovaný, redirect na onboarding

## 237. 237. Auth: Email Login
- [ ] Login s correct credentials → redirect na last visited page
- [ ] Wrong password → error 'Invalid credentials' (žiadne info o existencii účtu)
- [ ] 5x wrong → account lock 15 min

## 238. 238. Auth: Password Reset
- [ ] Klikni Forgot password, zadaj email
- [ ] Reset email doručený (1-time token, expires 1h)
- [ ] Set new password → auto login

## 239. 239. Auth: Magic Link
- [ ] Klikni Login with magic link, zadaj email
- [ ] Email doručený, link funguje 1x
- [ ] Druhý klik → 'Link expired'

## 240. 240. Auth: OAuth Google
- [ ] Klikni Continue with Google
- [ ] OAuth consent screen, allow
- [ ] Account vytvorený, profile pic z Google

## 241. 241. Auth: Session Refresh
- [ ] Po 1h aktivity → token auto-refresh
- [ ] Bez user interaction (background)
- [ ] Žiadny forced re-login

## 242. 242. Auth: Recent Auth Required
- [ ] Klikni Change email (sensitive action)
- [ ] Re-auth prompt (password)
- [ ] Po úspechu → change form prístupný 5 min

## 243. 243. Auth: 2FA Setup
- [ ] Otvor /settings/security
- [ ] Enable 2FA, scan QR kód (TOTP)
- [ ] Backup codes vygenerované (10 kódov)
- [ ] Login flow: password → TOTP prompt

## 244. 244. Auth: 2FA Recovery
- [ ] Stratený TOTP → Use backup code
- [ ] Backup code funguje 1x, then invalidated
- [ ] Po použití všetkých → support flow

## 245. 245. Auth: Email Change
- [ ] Change email v settings
- [ ] Verification odoslaný na NOVÝ email
- [ ] Notification odoslaný na STARÝ email (security)
- [ ] Po confirm: starý email už nefunguje

## 246. 246. Auth: Account Deletion
- [ ] Settings → Delete account
- [ ] Confirm s password + typing 'DELETE'
- [ ] 30-day grace period (možnosť obnoviť)
- [ ] Po 30 dňoch: hard delete (GDPR)

## 247. 247. Profile: Avatar Upload
- [ ] Upload avatar (JPG/PNG, max 5MB)
- [ ] Crop tool (circular)
- [ ] Save → zobrazí sa v header okamžite

## 248. 248. Profile: Handle Uniqueness
- [ ] Zmena handle na existujúci → error
- [ ] Handle validation: 3-20 znakov, [a-z0-9_]
- [ ] Reserved handles (admin, support) blokované

## 249. 249. Profile: Privacy Settings
- [ ] Toggle: profile public/private/friends-only
- [ ] Private profile → non-friend vidí iba meno + avatar
- [ ] Posts respektujú privacy setting

## 250. 250. Profile: Block User
- [ ] Block user X
- [ ] X nevidí tvoj profile, posts, comments
- [ ] Tvoje DM history s X je archivovaná
- [ ] X nemôže iniciovať nový DM

## 251. 251. Profile: Report User
- [ ] Report user s reason (spam/harassment/scam)
- [ ] Confirmation toast
- [ ] Admin notification v /admin/reports
- [ ] Reported user dostane warning po review

## 252. 252. Search: Users
- [ ] Search 'beata' → results za < 500ms
- [ ] GIN trigram index používaný (skontroluj EXPLAIN)
- [ ] Fuzzy match (typo tolerant)

## 253. 253. Search: Content
- [ ] Search posts, ProClass courses, Megatalent profiles
- [ ] FTS (Full-Text Search) ranking
- [ ] Filters: type, date range, language

## 254. 254. Search: Autocomplete
- [ ] Type 3 znaky → suggestions appear
- [ ] Keyboard navigation (↑/↓/Enter)
- [ ] Click suggestion → navigate

## 255. 255. Final E2E v15
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Auth flow: logout → login → 2FA → session refresh test
- [ ] Profile flow: edit → privacy → block test user → search
- [ ] Žiadne errors

## 256. 256. DM: Send Text
- [ ] Otvor DM s friend
- [ ] Pošli text message
- [ ] Recipient vidí message v reálnom čase (Realtime)
- [ ] Read receipt sa zobrazí po otvorení

## 257. 257. DM: Send Image
- [ ] Attach image (max 10MB)
- [ ] Upload progress bar
- [ ] Recipient vidí thumbnail, klikni → full size lightbox

## 258. 258. DM: Voice Message
- [ ] Hold mic button → record
- [ ] Release → send
- [ ] Waveform preview, play/pause
- [ ] Auto-delete po 30 dňoch (privacy)

## 259. 259. DM: Reply & Quote
- [ ] Long-press message → Reply
- [ ] Quote block sa zobrazí v inpute
- [ ] Send → recipient vidí quoted message

## 260. 260. DM: Delete Message
- [ ] Delete for me → zmizne iba u mňa
- [ ] Delete for everyone (do 1h) → zmizne u oboch
- [ ] Po 1h: 'Delete for everyone' nedostupné

## 261. 261. DM: Mute Conversation
- [ ] Mute → žiadne notifikácie
- [ ] Conversation viditeľná v inboxe (no badge)
- [ ] Unmute → notifikácie obnovené

## 262. 262. DM: Paid DM (Creator)
- [ ] Pošli DM creatorovi s paid_only flag
- [ ] Stripe checkout (€ 5)
- [ ] Po success: DM doručený, creator dostane 85% (€ 4.25)

## 263. 263. DM: PPV Attachment
- [ ] Creator pošle PPV image/video
- [ ] Recipient vidí blurred preview + price
- [ ] Pay → unlock content

## 264. 264. Notifications: In-App
- [ ] Trigger notification (like, comment, follow)
- [ ] Bell icon badge počíta unread
- [ ] Klikni bell → dropdown s posledných 20
- [ ] Mark all as read funkčné

## 265. 265. Notifications: Email Digest
- [ ] Settings → enable weekly digest
- [ ] Pondelok 09:00 UTC: email s top events
- [ ] Unsubscribe link funguje

## 266. 266. Notifications: Preferences
- [ ] Settings → notification preferences
- [ ] Toggle per type (likes, comments, mentions, DMs)
- [ ] Per channel (in-app, email, push)
- [ ] Save → settings persist

## 267. 267. Feed: Algorithm
- [ ] Otvor /wall
- [ ] Posts od friends s vyššou priority
- [ ] Recency decay (older posts lower rank)
- [ ] Engagement boost (likes/comments)

## 268. 268. Feed: Pagination
- [ ] Scroll down → infinite scroll loads next batch
- [ ] Žiadne duplicates
- [ ] Smooth scroll, no jank
- [ ] End reached → 'No more posts'

## 269. 269. Feed: Pull to Refresh (Mobile)
- [ ] Mobile viewport, swipe down z top
- [ ] Loading spinner
- [ ] Nové posts načítané

## 270. 270. Feed: Post Composer
- [ ] Klikni 'Create post'
- [ ] Text, image, video, poll, location
- [ ] Privacy selector (public/friends/group)
- [ ] Submit → post viditeľný okamžite

## 271. 271. Feed: Poll Voting
- [ ] Vote v poll
- [ ] Results visible po vote (alebo po end)
- [ ] Cannot vote 2x

## 272. 272. Feed: Hashtags
- [ ] Post s #hashtag
- [ ] Hashtag clickable → /tags/:tag
- [ ] Trending hashtags na sidebar

## 273. 273. Feed: Mentions
- [ ] Type @user → autocomplete
- [ ] Mentioned user dostane notifikáciu
- [ ] Mention link na profile

## 274. 274. Friendship & Follow
- [ ] Send friend request
- [ ] Recipient accepts → bilateral friendship
- [ ] Follow (asymmetric) → no acceptance needed
- [ ] Unfriend / Unfollow funkčné

## 275. 275. Final E2E v16
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] DM flow: send text → image → voice → delete → mute
- [ ] Feed flow: create post → poll → hashtag → mention friend
- [ ] Notif flow: trigger 5 types, verify all delivered

## 276. 276. Communities: Create
- [ ] Otvor /communities/new
- [ ] Vyplň name, description, category, cover image
- [ ] Submit → community vytvorená, owner = ja
- [ ] Redirect na /community/:id

## 277. 277. Communities: Join / Leave
- [ ] Otvor public community → Join (instant)
- [ ] Otvor private → Request to join → approval flow
- [ ] Leave → odstránenie z members + RLS revoke

## 278. 278. Communities: Roles
- [ ] Owner: full control
- [ ] Moderator: posts moderation, ban users
- [ ] Member: post + comment
- [ ] Role change cez admin panel

## 279. 279. Communities: Scoped Feed
- [ ] Posty v community viditeľné iba členom
- [ ] Non-member dostane 403 cez API
- [ ] Feed sorted by recent + pinned

## 280. 280. Communities: Bazár (Marketplace)
- [ ] Vytvor product v community bazár
- [ ] Members vidia listing, môžu kúpiť
- [ ] Stripe checkout, seller dostane 85%

## 281. 281. Communities: Gallery
- [ ] Upload images do community gallery
- [ ] Album organization (folders)
- [ ] Lightbox view, download (ak povolené)

## 282. 282. Communities: Events
- [ ] Vytvor event (date, location, capacity)
- [ ] RSVP (going / maybe / not going)
- [ ] Calendar export (.ics)
- [ ] Reminder 1h pred eventom

## 283. 283. Communities: Polls
- [ ] Owner/moderator vytvorí poll
- [ ] Members votujú
- [ ] Results po deadline

## 284. 284. Stories: Create
- [ ] Klikni 'Add story' v top bar
- [ ] Capture photo/video alebo upload
- [ ] Filters, text overlay, stickers
- [ ] Publish → expires 24h

## 285. 285. Stories: View
- [ ] Klikni story bubble → fullscreen viewer
- [ ] Auto-advance po 5s (photo) alebo full video
- [ ] Tap left/right → prev/next
- [ ] Swipe down → close

## 286. 286. Stories: Replies
- [ ] Reply input na bottom
- [ ] Send → DM creator s quoted story
- [ ] Creator vidí replies v inbox

## 287. 287. Stories: Viewers List
- [ ] Owner vidí list viewers (s timestamps)
- [ ] Order: most recent first
- [ ] Anonymous mode pre niektorých viewers (premium)

## 288. 288. Stories: Highlights
- [ ] Save story do highlight (permanent)
- [ ] Highlight zobrazený na profile
- [ ] Edit cover, reorder, delete

## 289. 289. Live Stream: Start
- [ ] Klikni Go Live → permission camera/mic
- [ ] Preview → Start broadcasting
- [ ] WebRTC stream, viewer count real-time

## 290. 290. Live Stream: Chat
- [ ] Viewers môžu chatovať počas live
- [ ] Pinned message od creatora
- [ ] Slow mode (1 msg / 5s)
- [ ] Moderator timeout/ban

## 291. 291. Live Stream: Tips
- [ ] Viewer pošle tip počas live
- [ ] Animation + sound notification
- [ ] Top tippers leaderboard

## 292. 292. Live Stream: Recording
- [ ] Po skončení live: VOD uložený
- [ ] Available v profile pre 30 dní
- [ ] Premium: permanent VOD

## 293. 293. Groups (Legacy): Migration
- [ ] Stará groups data migrované do communities
- [ ] Žiadne broken references
- [ ] Old /groups/:id → redirect na /community/:id

## 294. 294. Realtime Presence Heartbeat
- [ ] Otvor app v 2 tabs
- [ ] Tab A vidí Tab B ako online (green dot)
- [ ] Close Tab B → po 30s offline status
- [ ] Heartbeat každých 25s

## 295. 295. Final E2E v17
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Community flow: create → invite → post → bazár → event
- [ ] Story flow: create → view → reply → highlight
- [ ] Live flow: start → chat → tip → end → VOD

## 296. 296. ProClass: Browse Courses
- [ ] Otvor /proclass
- [ ] Filter podľa kategórie, level, price
- [ ] Search funguje (FTS)
- [ ] Course card: thumbnail, title, instructor, rating, price

## 297. 297. ProClass: Purchase Course
- [ ] Klikni Buy → Stripe checkout
- [ ] Po success: course unlocked v /my-courses
- [ ] Instructor dostane 85% (€), platforma 15%

## 298. 298. ProClass: Video Player (HLS)
- [ ] Otvor lesson → HLS player
- [ ] Adaptive bitrate (auto)
- [ ] Speed control (0.5x – 2x), captions
- [ ] Resume from last position

## 299. 299. ProClass: Progress Tracking
- [ ] Watch lesson > 90% → marked complete
- [ ] Progress bar updated v course overview
- [ ] Certificate po 100% completion

## 300. 300. ProClass: Q&A;
- [ ] Ask question pod lesson
- [ ] Instructor odpovedá
- [ ] Upvote questions
- [ ] Notification pre instructor

## 301. 301. ProClass: Instructor Dashboard
- [ ] Login ako instructor
- [ ] Analytics: enrollments, revenue, completion rate
- [ ] Upload new lesson, edit course

## 302. 302. KitchenStars Arena: Recipe Submit
- [ ] Otvor /kitchenstars
- [ ] Submit recipe (title, ingredients, steps, photo)
- [ ] Moderation queue → approved by admin
- [ ] Public po approval

## 303. 303. KitchenStars: Voting Contest
- [ ] Týždenný contest beží (Mon-Sun)
- [ ] Vote (1 vote = free, max 5/deň)
- [ ] Extra votes = 1 credit each
- [ ] Winner: top recipe by votes

## 304. 304. KitchenStars: Tipy
- [ ] Pošli tip chefovi (€ 1 – € 50)
- [ ] 10% platforma fee
- [ ] Chef vidí tip v dashboard

## 305. 305. Megatalent: Submission
- [ ] Otvor /megatalent → Submit talent
- [ ] Upload video (max 5 min)
- [ ] Category, description
- [ ] € 5 submission fee

## 306. 306. Megatalent: 80/20 Escrow
- [ ] Po contest end: prize pool split
- [ ] Winner: 80% z prize pool
- [ ] Platform: 20%
- [ ] Funds released after 7-day dispute window

## 307. 307. Megatalent: Watch Party
- [ ] Live watch party před finale
- [ ] Tickets € 2
- [ ] Synchronizovaný playback pre všetkých
- [ ] Chat + reactions

## 308. 308. Megatalent: 24h Stories
- [ ] Súťažiaci postuje story (BTS content)
- [ ] Expires po 24h
- [ ] Viewers môžu reagovať

## 309. 309. Fundraising: Create Campaign
- [ ] Otvor /fundraising/new
- [ ] Goal amount, deadline, description, media
- [ ] Stripe Connect onboarding (KYC)
- [ ] Submit → moderation review

## 310. 310. Fundraising: Donate
- [ ] Otvor campaign → Donate € amount
- [ ] Stripe checkout
- [ ] Donation visible (anonymous option)
- [ ] Goal progress bar updated

## 311. 311. Fundraising: Payout
- [ ] Po deadline: funds transferred via Stripe Connect
- [ ] Platform fee: 5%
- [ ] Email confirmation pre creator

## 312. 312. Brand Collaboration: Escrow
- [ ] Brand creates collab brief (budget € 500)
- [ ] Creator applies, brand accepts
- [ ] Funds held in Stripe escrow
- [ ] Po deliverable approval: 80% creator, 20% platform

## 313. 313. Brand Collaboration: Release Workflow
- [ ] Creator submits deliverable
- [ ] Brand reviews (7 dní auto-approve)
- [ ] Approve → funds released
- [ ] Reject → revision request alebo dispute

## 314. 314. Tip Jar (P2P)
- [ ] Otvor profil → Tip jar button
- [ ] Send tip (€ 1+)
- [ ] Recipient: 90%, platform: 10%
- [ ] Notification + thank-you note option

## 315. 315. Final E2E v18
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] Creator monetization: ProClass course buy → Megatalent vote → tip
- [ ] Fundraising donation flow
- [ ] Brand collab escrow flow (skip ak nie je test brand)

## 316. 316. AI Tools: Tarot Reading
- [ ] Otvor /mystical/tarot
- [ ] Vyber spread (3-card, Celtic Cross)
- [ ] Generate reading → AI response < 5s
- [ ] Cost: 3 credits

## 317. 317. AI Tools: Dream Interpreter
- [ ] Otvor /mystical/dreams
- [ ] Zadaj dream description (min 20 znakov)
- [ ] AI interpretation + symbols breakdown
- [ ] Cost: 5 credits

## 318. 318. AI Tools: Horoscope
- [ ] Otvor /mystical/horoscope
- [ ] Vyber znamenie + period (daily/weekly/monthly)
- [ ] Personalizovaný horoskop
- [ ] Cost: 2 credits

## 319. 319. AI Tools: Virtual Pet Chat
- [ ] Otvor /virtual-pet
- [ ] Chat s petom (AI personality based on type)
- [ ] Cost: 1 credit / message
- [ ] Pet stats update (happiness, hunger)

## 320. 320. AI Tools: Coach (Health)
- [ ] Otvor /health/coach
- [ ] Ask question (fitness/nutrition)
- [ ] AI response + disclaimer (not medical advice)
- [ ] Cost: 3 credits

## 321. 321. AI Tools: Course Generator
- [ ] Otvor /education/generate
- [ ] Topic + difficulty → AI generates 10 lessons
- [ ] Cost: 50 credits
- [ ] Saved do /my-courses

## 322. 322. AI Tools: Quiz Generator
- [ ] Otvor course → Generate quiz
- [ ] AI vytvorí 10 questions s answers
- [ ] Cost: 10 credits

## 323. 323. AI Tools: Image Generation
- [ ] Otvor /studio/image
- [ ] Prompt + style (anime, realistic, oil painting)
- [ ] Generate → result za 10-30s
- [ ] Cost: 5 credits (fast), 10 (premium)

## 324. 324. AI Tools: Video Generation
- [ ] Otvor /studio/video
- [ ] Prompt + duration (3s/5s/10s)
- [ ] Generate → result za 1-3 min
- [ ] Cost: 30 credits / 3s

## 325. 325. AI Tools: Text-to-Speech
- [ ] Zadaj text + vyber voice
- [ ] Generate audio file (mp3)
- [ ] Download alebo play inline
- [ ] Cost: 2 credits / 100 znakov

## 326. 326. AI Tools: Speech-to-Text
- [ ] Record audio (max 5 min)
- [ ] Transcript generated
- [ ] Cost: 1 credit / minute

## 327. 327. AI Moderation: Posts
- [ ] Post s NSFW content
- [ ] AI flag → moderation queue
- [ ] Admin review → approve/reject
- [ ] Auto-block pre highly toxic content

## 328. 328. AI Moderation: DMs
- [ ] Send DM s harassment text
- [ ] AI warning v sender chat ('This may violate guidelines')
- [ ] Recipient: optional auto-blur
- [ ] Report → admin queue

## 329. 329. AI Moderation: Images
- [ ] Upload image s nudity (test)
- [ ] AI scan → block + notify user
- [ ] False positive: appeal process

## 330. 330. AI Cost Display
- [ ] Pred každým AI action: zobrazený cost (credits)
- [ ] Current balance v header
- [ ] Insufficient credits → paywall / buy credits CTA

## 331. 331. AI Credit Refund
- [ ] AI request fails (timeout/error)
- [ ] Credits refunded automaticky
- [ ] Notification: 'Your X credits have been refunded'

## 332. 332. AI Throttling Per User
- [ ] 20 AI requests za 1 min od jedného usera
- [ ] Rate limit 429 po prekročení
- [ ] Banner: 'Slow down, try again in Xs'

## 333. 333. AI Gateway: Lovable AI
- [ ] Verify Lovable AI Gateway používaný (nie OpenAI direct)
- [ ] Models: google/gemini-2.5-flash (default), pro variants
- [ ] Free models počas promo (gemini-2.5-flash do 13. okt 2025)

## 334. 334. AI Gateway: Fallback
- [ ] Primary model down → fallback na alternativny model
- [ ] User vidí response (slight delay)
- [ ] Log v Sentry pre admin

## 335. 335. Final E2E v19
- [ ] Login: beata.vikorova@yandex.com / BiankaDominik25
- [ ] AI flow: tarot → dream → horoscope → image gen → video gen
- [ ] Skontroluj credits decrement správne
- [ ] Test 1 throttle scenario (20 reqs fast)

## 336. 336. Kids Channel: Login & Parental Gate
- [ ] Otvor /kids
- [ ] Zadaj rodičovský PIN
- [ ] Over vekové obmedzenie 6–12
- [ ] Skontroluj redirect ak nie je PIN

## 337. 337. Kids Channel: Coloring Pages
- [ ] Vyber pages
- [ ] Nakresli a ulož
- [ ] Over uloženie do galérie

## 338. 338. Kids Channel: AI Coach (filtered)
- [ ] Otvor AI coach pre deti
- [ ] Over SFW filter
- [ ] Skontroluj credit cost 3

## 339. 339. Kids Channel: Games Hub
- [ ] Otvor /games
- [ ] Spusti GameDistribution hru
- [ ] Over fullscreen mode

## 340. 340. Teen Hub: Access & Filtering
- [ ] Login ako 13–15
- [ ] Over odlišný filter ako pre 16+
- [ ] Skontroluj zablokované sekcie

## 341. 341. Fairy Castles: Browse
- [ ] Otvor sekciu
- [ ] Skontroluj animations
- [ ] Over performance na mobile 360px

## 342. 342. Brand Arena: Sponsor Tier Selection
- [ ] Vyber Enterprise tier
- [ ] Spusti Stripe checkout 4242 4242 4242 4242
- [ ] Over branding persistence

## 343. 343. Brand Arena: Leaderboard
- [ ] Otvor leaderboard
- [ ] Over realtime updates
- [ ] Skontroluj rank changes

## 344. 344. Priority Support: SLA Ticket
- [ ] Vytvor ticket ako prémiový klient
- [ ] Over SLA timer
- [ ] Skontroluj eskaláciu

## 345. 345. Lucky Wheel: Daily Spin
- [ ] Otvor rewards
- [ ] Spusti spin
- [ ] Over claim odmeny
- [ ] Skontroluj 24h cooldown

## 346. 346. Streaks: Daily Login
- [ ] Login 7 dní v rade
- [ ] Over streak counter
- [ ] Skontroluj milestone reward

## 347. 347. Challenges: Weekly XP
- [ ] Otvor challenges
- [ ] Splň quest
- [ ] Over XP a leaderboard

## 348. 348. Referral System: Invite Friend
- [ ] Skopíruj referral link
- [ ] Otvor v incognito a registruj
- [ ] Over referrer bonus credits

## 349. 349. Referral: Fraud Detection
- [ ] Skús viacero registrácií z 1 IP
- [ ] Over rate limit
- [ ] Skontroluj fraud flag

## 350. 350. GDPR: Data Export
- [ ] Otvor settings → export
- [ ] Stiahni JSON archív
- [ ] Over kompletnosť dát

## 351. 351. GDPR: Account Erasure
- [ ] Spusti erasure request
- [ ] Potvrď cez email
- [ ] Over soft delete + 30-day window

## 352. 352. PWA: Install Prompt
- [ ] Otvor v Chrome mobile
- [ ] Over A2HS prompt
- [ ] Nainštaluj a spusti standalone

## 353. 353. Service Worker: Offline Mode
- [ ] Načítaj app online
- [ ] Vypni sieť
- [ ] Skontroluj offline.html fallback

## 354. 354. Push Notifications: Subscribe
- [ ] Povolí notifikácie
- [ ] Pošli test push z admina
- [ ] Over delivery

## 355. 355. Final E2E v20: Kids + Teen + GDPR + PWA
- [ ] Kompletný flow: login → kids → teen filter → GDPR export → PWA install
- [ ] Over všetky kroky bez chýb

## 356. 356. Stripe Webhook: Payment Succeeded
- [ ] Vykonaj testovaciu platbu
- [ ] Skontroluj webhook log v Supabase
- [ ] Over zápis do transactions

## 357. 357. Stripe Webhook: Refund
- [ ] Spusti refund cez admin
- [ ] Over webhook refunded event
- [ ] Skontroluj credit reverse

## 358. 358. Stripe Disputes Handling
- [ ] Simuluj chargeback (4000 0000 0000 0259)
- [ ] Over dispute notification
- [ ] Skontroluj admin dashboard

## 359. 359. SCA / 3DS Flow
- [ ] Použi 4000 0027 6000 3184
- [ ] Over 3DS challenge
- [ ] Skontroluj success redirect

## 360. 360. Subscription Lifecycle: Create
- [ ] Subscribe na Creator plan
- [ ] Over invoice + period_end
- [ ] Skontroluj entitlements

## 361. 361. Subscription: Pause
- [ ] Pauznú subscription
- [ ] Over pause_collection
- [ ] Skontroluj limit 3 mesiace

## 362. 362. Subscription: Resume & Cancel
- [ ] Resume cez customer portal
- [ ] Cancel at period end
- [ ] Over status zmenu

## 363. 363. Dunning: Failed Payment
- [ ] Simuluj failed renewal
- [ ] Over retry sequence (3x)
- [ ] Skontroluj email + grace period

## 364. 364. Winback Campaign
- [ ] Cancelovaný user dostane winback email
- [ ] Over discount link
- [ ] Skontroluj re-subscribe flow

## 365. 365. Daily Reconciliation Cron
- [ ] Skontroluj reconciliation log
- [ ] Over Stripe vs DB balance
- [ ] Skontroluj alerty pri rozdiele

## 366. 366. Auto-Payout Cron (Creators)
- [ ] Splň minimálnu prahovú hodnotu
- [ ] Spusti cron manuálne
- [ ] Over Stripe Connect transfer

## 367. 367. Creator KYC
- [ ] Otvor onboarding
- [ ] Doplň údaje Stripe Express
- [ ] Over verification status

## 368. 368. Tax & Invoicing
- [ ] Sprav platbu z EU
- [ ] Over VAT 20% aplikované
- [ ] Skontroluj invoice PDF

## 369. 369. Multi-Currency Display
- [ ] Prepni currency selector (info only)
- [ ] Over že charge je vždy EUR
- [ ] Skontroluj UI labels

## 370. 370. Affiliate Tiers
- [ ] Skontroluj tier breakdown
- [ ] Over commission % per tier
- [ ] Skontroluj upgrade trigger

## 371. 371. Cohort Retention Dashboard
- [ ] Otvor admin analytics
- [ ] Over D1/D7/D30 cohort
- [ ] Skontroluj export CSV

## 372. 372. Subscription Analytics MRR/ARR
- [ ] Over MRR widget
- [ ] Skontroluj churn rate
- [ ] Over LTV výpočet

## 373. 373. Web Vitals: LCP/CLS/INP
- [ ] Otvor Lighthouse v Chrome
- [ ] Spusti audit homepage
- [ ] Over LCP < 2.5s, CLS < 0.1

## 374. 374. Bundle Size Report
- [ ] Spusti scripts/bundle-report.mjs
- [ ] Over main bundle < 500KB gzip
- [ ] Skontroluj code-splitting

## 375. 375. Final E2E v21: Stripe + Subscriptions + Reconciliation
- [ ] Full flow: subscribe → pause → resume → cancel → refund → reconciliation
- [ ] Over všetky webhooks

## 376. 376. RLS Audit: Profiles Table
- [ ] Skontroluj policy SELECT/UPDATE
- [ ] Over anonymous block
- [ ] Skontroluj security definer funkcie

## 377. 377. RLS Audit: Messages/DMs
- [ ] Over že user vidí len svoje DMs
- [ ] Skús pristúpiť cudzie message_id
- [ ] Skontroluj 403/empty result

## 378. 378. RLS Audit: User Roles
- [ ] Over že role check ide cez has_role()
- [ ] Skontroluj zákaz selfupdate role
- [ ] Test privilege escalation

## 379. 379. RLS Audit: Transactions
- [ ] Over že user vidí len vlastné transakcie
- [ ] Skontroluj service_role bypass
- [ ] Test admin view

## 380. 380. Anonymous Dating Profiles RLS
- [ ] Over masking PII
- [ ] Skontroluj že fotky sú signed URLs
- [ ] Test prístup bez match

## 381. 381. Security Scan: SQL Injection
- [ ] Skús ' OR 1=1 -- v search
- [ ] Over že PostgREST escapuje
- [ ] Skontroluj WAF logy

## 382. 382. Security Scan: XSS in Posts
- [ ] Vlož alert(1)
- [ ] Over sanitizeHtml
- [ ] Skontroluj DOMPurify

## 383. 383. Rate Limiting: API
- [ ] Spusti 100 req/min na endpoint
- [ ] Over 429 response
- [ ] Skontroluj rate limit headers

## 384. 384. Rate Limiting: AI Tools
- [ ] Vyčerpaj AI credits
- [ ] Over throttling per user
- [ ] Skontroluj refund pri error

## 385. 385. Realtime Presence: Heartbeat
- [ ] Otvor 2 sessions
- [ ] Over online indicator
- [ ] Skontroluj cleanup pri disconnect

## 386. 386. Realtime Topic Security
- [ ] Skús subscribe na cudzí kanál
- [ ] Over RLS na broadcast
- [ ] Skontroluj 401

## 387. 387. Edge Function: create-checkout
- [ ] Vyvolaj funkciu
- [ ] Over Stripe session URL
- [ ] Skontroluj idempotency_key

## 388. 388. Edge Function: stripe-webhook
- [ ] Pošli test event
- [ ] Over signature verification
- [ ] Skontroluj DB update

## 389. 389. Edge Function: AI Moderation
- [ ] Pošli flagged content
- [ ] Over rejection
- [ ] Skontroluj log v moderation table

## 390. 390. Edge Function Logs
- [ ] Otvor Supabase Functions logs
- [ ] Filter podľa function
- [ ] Over error rate < 1%

## 391. 391. Database Slow Queries
- [ ] Spusti supabase slow_queries
- [ ] Identifikuj top 5
- [ ] Over indexes pre dané queries

## 392. 392. FTS Search: Posts
- [ ] Hľadaj kľúčové slovo
- [ ] Over GIN trigram index hit
- [ ] Skontroluj rank order

## 393. 393. Profile Cache: Hit Rate
- [ ] Otvor profil 2x
- [ ] Over cache hit (DevTools)
- [ ] Skontroluj TTL invalidácia

## 394. 394. SEO: Sitemap Generation
- [ ] Otvor /sitemap-index.xml
- [ ] Over zoznam sub-sitemaps
- [ ] Skontroluj lastmod

## 395. 395. Final E2E v22: Security + Performance + Realtime
- [ ] Full audit: RLS + XSS + rate limit + realtime + edge functions
- [ ] Over všetky bez critical issues

## 396. 396. Lighthouse CI: Performance Score
- [ ] Spusti Lighthouse CI na /index, /jobs, /megatalent
- [ ] Perf ≥ 85, A11y ≥ 90, SEO ≥ 95
- [ ] Žiadne regresie oproti baseline
- [ ] Artefakt nahraný do GitHub Actions
- [ ] Spusti `bun scripts/i18n-check.mjs`
- [ ] 12 jazykov, 0 chýbajúcich kľúčov
- [ ] EN je default, fallback funguje
- [ ] Lobster Two font sa neaplikuje na ne-latinky

## 398. 398. Sitemap Generation
- [ ] `bun scripts/generate-sitemap.mjs` prejde bez chýb
- [ ] /sitemap.xml + /sitemap-jobs.xml validné
- [ ] Google Search Console: 0 errors
- [ ] lastmod aktualizovaný

## 399. 399. Robots.txt & Crawlers
- [ ] /robots.txt obsahuje Sitemap odkaz
- [ ] Disallow pre /admin, /api
- [ ] User-agent: * povolený pre verejné stránky
- [ ] Žiadne secret routes neexponované

## 400. 400. Structured Data (JSON-LD)
- [ ] Schema.org Job, Article, BreadcrumbList na relevantných stránkach
- [ ] Google Rich Results Test prejde
- [ ] Žiadne validation warnings
- [ ] Organization markup na /index

## 401. 401. OpenGraph & Twitter Cards
- [ ] og:title, og:description, og:image na všetkých route
- [ ] Twitter card type=summary_large_image
- [ ] Facebook Debugger: cache refresh OK
- [ ] Image 1200x630 px

## 402. 402. Canonical URLs
- [ ] <link rel=canonical> na každej stránke
- [ ] Žiadne duplicate content warnings
- [ ] www → apex redirect 301
- [ ] HTTPS enforced

## 403. 403. Accessibility: Keyboard Nav
- [ ] Tab order logický cez celú stránku
- [ ] Focus ring viditeľný (min 2px)
- [ ] Žiadne keyboard traps
- [ ] ESC zatvára modaly

## 404. 404. Accessibility: Screen Reader
- [ ] NVDA/VoiceOver číta nadpisy v poradí
- [ ] Alt text na všetkých img
- [ ] ARIA labels na ikonách-buttonoch
- [ ] Live regions pre toast notifikácie

## 405. 405. Color Contrast WCAG AA
- [ ] Text ≥ 4.5:1 ratio
- [ ] Large text ≥ 3:1
- [ ] Primary purple #7c3aed na dark bg: OK
- [ ] Form errors viditeľné

## 406. 406. Mobile 360px Layout
- [ ] Žiadny horizontálny scroll na 360px
- [ ] Tap targets ≥ 44x44 px
- [ ] Modaly fit-to-screen
- [ ] Bottom nav nepřekrývá obsah

## 407. 407. Tablet 768px Layout
- [ ] Grid prepne na 2 stĺpce
- [ ] Sidebar collapsible
- [ ] Touch + hover funguje
- [ ] Orientation change OK

## 408. 408. Desktop 1920px Layout
- [ ] Max-width container 1440px
- [ ] Žiadne stretched layouty
- [ ] Hero video plynulé
- [ ] Sticky header funkčný

## 409. 409. Browser: Safari iOS
- [ ] Video autoplay (muted) funguje
- [ ] Backdrop-filter renderuje
- [ ] Safe area inset rešpektovaný
- [ ] PWA install prompt

## 410. 410. Browser: Chrome Android
- [ ] Push notifications fungujú
- [ ] Service worker registered
- [ ] Pull-to-refresh nekoliduje
- [ ] Share API funkčné

## 411. 411. Browser: Firefox Desktop
- [ ] CSS grid + flex layouty OK
- [ ] WebGL pre Three.js scény
- [ ] Realtime WebSocket stabilný
- [ ] DevTools warnings = 0

## 412. 412. Cross-Browser: Edge
- [ ] Chromium Edge: parity s Chrome
- [ ] Stripe Elements renderujú
- [ ] File upload drag&drop;
- [ ] Print stylesheet OK

## 413. 413. Error Boundary: Component Crash
- [ ] Vyhoď chybu v dieťati komponentu
- [ ] ErrorBoundary zachytí + log do Sentry/logger
- [ ] Fallback UI s 'Reload' tlačidlom
- [ ] Zvyšok appu funkčný
- [ ] Neexistujúca route → /not-found stránka
- [ ] SEO meta noindex
- [ ] Link na homepage
- [ ] 500 error → friendly fallback

## 415. 415. Final E2E v23
- [ ] Komplet flow: login → browse → checkout → consume → logout
- [ ] Žiadne console errors
- [ ] Žiadne 4xx/5xx v Network tab
- [ ] Všetky predošlé sekcie 396–414 ✓

## 416. 416. Admin Panel: Login & RBAC
- [ ] Login ako admin (has_role check)
- [ ] Non-admin → 403 redirect
- [ ] Audit log zaznamená prístup
- [ ] Session timeout po 30 min idle

## 417. 417. Admin: User Management
- [ ] Vyhľadaj usera podľa emailu
- [ ] Suspendovať / unsuspend
- [ ] Reset password trigger
- [ ] Zmena roly cez user_roles tabuľku

## 418. 418. Admin: Content Moderation Queue
- [ ] Flagged posts list načítaný
- [ ] Approve / reject / delete akcie
- [ ] Moderator notes uložené
- [ ] Realtime update queue

## 419. 419. Admin: Refund Processing
- [ ] Otvor transakciu → Refund button
- [ ] Stripe refund created
- [ ] Credits stiahnuté z účtu usera
- [ ] Email confirmation poslaný

## 420. 420. Admin: Payout Approval
- [ ] KYC verified creators zoznam
- [ ] Approve payout → Stripe transfer
- [ ] Failed payout retry logic
- [ ] Audit trail kompletný

## 421. 421. Admin: Analytics Dashboard
- [ ] DAU/MAU/WAU metrics
- [ ] Revenue breakdown po module
- [ ] Top creators leaderboard
- [ ] Export do CSV funguje

## 422. 422. Notifications: In-App Bell
- [ ] Nová notifikácia → bell badge +1
- [ ] Klik otvorí drawer
- [ ] Mark as read funguje
- [ ] Realtime update bez refresh

## 423. 423. Notifications: Email Digest
- [ ] Daily digest cron beží 08:00
- [ ] HTML template renderuje
- [ ] Unsubscribe link funkčný
- [ ] Žiadne duplicate emaily

## 424. 424. Notifications: Push (Web)
- [ ] Subscribe prompt zobrazený
- [ ] Permission granted → token uložený
- [ ] Push z backendu → notifikácia zobrazená
- [ ] Click otvorí správnu route

## 425. 425. Settings: Profile Edit
- [ ] Avatar upload (max 2MB)
- [ ] Bio max 500 znakov
- [ ] Save → toast 'Updated'
- [ ] Realtime sync v ostatných taboch

## 426. 426. Settings: Privacy Controls
- [ ] Profile visibility: public/friends/private
- [ ] Hide from search toggle
- [ ] Block list management
- [ ] DM permissions setting

## 427. 427. Settings: Notification Preferences
- [ ] Per-category opt-in/out
- [ ] Quiet hours nastaviteľné
- [ ] Email vs push toggle
- [ ] Save persistuje cez session

## 428. 428. Settings: Language Switch
- [ ] 12 jazykov v dropdown
- [ ] Výber → instant UI reload
- [ ] localStorage persistuje
- [ ] Default EN pre nových userov

## 429. 429. Settings: Currency Display
- [ ] Default EUR €
- [ ] Žiadna iná možnosť (locked)
- [ ] Všetky ceny konzistentné
- [ ] Stripe checkout v EUR

## 430. 430. Settings: Account Deletion
- [ ] Confirm modal s heslom
- [ ] GDPR erasure spustená
- [ ] Stripe subscription cancelled
- [ ] Email confirmation 'Account deleted'

## 431. 431. Search: Global Bar
- [ ] Min 2 znaky → suggestions
- [ ] Users, posts, hubs v results
- [ ] Klik na výsledok → správna route
- [ ] FTS index používa GIN trigram

## 432. 432. Search: Filters & Sort
- [ ] Filter podľa typu (user/post/hub)
- [ ] Sort: relevance/date/popularity
- [ ] URL query params persistujú
- [ ] Pagination funkčná

## 433. 433. Onboarding: New User Flow
- [ ] Sign up → email verify
- [ ] Profile setup wizard (3 kroky)
- [ ] Tutorial tooltips
- [ ] Welcome credits (ak applicable)

## 434. 434. Onboarding: Returning User
- [ ] Auto-login z httpOnly cookie
- [ ] Posledná route restored
- [ ] No tutorial replay
- [ ] Notifications preloaded

## 435. 435. Final E2E v24
- [ ] Admin → moderate → refund flow
- [ ] User → settings → delete account
- [ ] Search & notifications cross-check
- [ ] Sekcie 416–434 ✓

## 436. 436. Jobs Hub: Browse Listings
- [ ] /jobs načíta zoznam pozícií
- [ ] Filter: lokácia, kategória, plat
- [ ] Pagination 20/strana
- [ ] SEO meta description per listing

## 437. 437. Jobs: Employer Post Job
- [ ] Login ako employer
- [ ] Vytvor novú pozíciu, Stripe payment
- [ ] Listing live po úspešnej platbe
- [ ] Edit/delete vlastných listingov

## 438. 438. Jobs: Apply Flow
- [ ] Klik 'Apply' → CV upload
- [ ] Cover letter (max 2000 chars)
- [ ] Submit → employer dostane notifikáciu
- [ ] Applicant vidí status v dashboarde

## 439. 439. Jobs: SEO & Sitemap
- [ ] JobPosting JSON-LD schema validný
- [ ] /sitemap-jobs.xml obsahuje aktívne pozície
- [ ] Google Jobs preview OK
- [ ] Indexable bez login

## 440. 440. Fundraising: Campaign Create
- [ ] Vytvor kampaň (title, goal, story)
- [ ] Image upload + video URL
- [ ] Stripe Connect account potrebný
- [ ] Live po admin approve

## 441. 441. Fundraising: Donate Flow
- [ ] Klik 'Donate' → suma + správa
- [ ] Stripe checkout → success
- [ ] 80/20 split (creator/platform)
- [ ] Donor list aktualizovaný

## 442. 442. Fundraising: Payout to Creator
- [ ] Po dosiahnutí milestone → payout
- [ ] Stripe transfer na connected account
- [ ] Email notifikácia creator
- [ ] Audit log zapísaný

## 443. 443. Megatalent: Browse Contestants
- [ ] /megatalent zoznam load
- [ ] Filter: kategória, krajina
- [ ] Voting period status badge
- [ ] Video preview hover

## 444. 444. Megatalent: Vote (Paid)
- [ ] Klik 'Vote' → credit charge
- [ ] Vote zapísaný do DB
- [ ] Realtime leaderboard update
- [ ] 100k bonus voting milestone

## 445. 445. Megatalent: Watch Party
- [ ] Join party room
- [ ] Sync video playback
- [ ] Chat realtime
- [ ] Host controls funkčné

## 446. 446. Megatalent: Go Live
- [ ] Creator klik 'Go Live'
- [ ] Browser camera permission
- [ ] Stream štartuje (HLS/WebRTC)
- [ ] Viewers count realtime

## 447. 447. Megatalent: Stories 24h
- [ ] Upload story (image/video)
- [ ] Auto-delete po 24h cron
- [ ] Views counter
- [ ] DM reply z story

## 448. 448. Dating: Anonymous Browse
- [ ] /dating bez login → blurred profiles
- [ ] Match potential indicator
- [ ] Pay-to-reveal flow
- [ ] RLS chráni real identitu

## 449. 449. Dating: Match & Chat
- [ ] Match → DM thread vytvorený
- [ ] Realtime messages
- [ ] Photo unlock cez credits
- [ ] Block/report funkčné

## 450. 450. Confessions: Anonymous Post
- [ ] Post bez user_id v UI
- [ ] Sanitized HTML
- [ ] Max 500 znakov
- [ ] Daily limit per IP enforced

## 451. 451. Confessions: Blockchain Receipt
- [ ] Po publish → hash generated
- [ ] Receipt link zobrazený
- [ ] Verify endpoint funkčný
- [ ] Timestamp immutable

## 452. 452. Property Hub: Listing Create
- [ ] Owner pridá nehnuteľnosť
- [ ] Photos (min 3, max 20)
- [ ] Mapa s polohou
- [ ] Stripe listing fee charged

## 453. 453. Property: Inquiry Flow
- [ ] Visitor klik 'Inquire'
- [ ] Login required → modal
- [ ] Message → owner notifikácia
- [ ] Thread v DM

## 454. 454. Property: Featured Boost
- [ ] Pay-to-boost button
- [ ] Stripe payment
- [ ] Listing pinned top 7 dní
- [ ] Expiry cron downgrade

## 455. 455. Final E2E v25
- [ ] Jobs apply + Fundraising donate + Megatalent vote
- [ ] Dating match + Confession post + Property inquiry
- [ ] Žiadne console errors
- [ ] Sekcie 436–454 ✓

## 456. 456. Kids Hub: Parental Gate
- [ ] Otvor /kids ako neprihlásený.
- [ ] Over že sa zobrazí Parental Gate (matematická úloha 16+).
- [ ] Zadaj nesprávnu odpoveď → blokovaný prístup.
- [ ] Zadaj správnu → vstup povolený, session 30 min.

## 457. 457. Kids Hub: Age Verification
- [ ] Profil dieťaťa < 6 rokov → odmietnutý.
- [ ] 6–12 rokov → Kids režim.
- [ ] 13–15 → Teen režim.
- [ ] 16+ → main platform.

## 458. 458. Kids Hub: Content Filter
- [ ] Over že žiadny dospelý obsah neprejde do feedu.
- [ ] AI moderácia blokuje nevhodné slová.
- [ ] Report tlačidlo viditeľné na každom poste.

## 459. 459. Kids Hub: Fairy Castles
- [ ] Otvor modul, vyber hrad.
- [ ] Over animácie a zvuk (mute toggle funguje).
- [ ] Coin reward sa pripíše po dokončení úlohy.

## 460. 460. Kids Hub: AI Story Generator
- [ ] Zadaj tému ('drak a princezná').
- [ ] Over že príbeh je SFW, max 300 slov.
- [ ] Credit cost 3 sa odpočíta.

## 461. 461. Kids Hub: Drawing Pad
- [ ] Nakresli, ulož.
- [ ] Galéria zobrazí len vlastné kresby.
- [ ] Share len cez rodiča (email link).

## 462. 462. Kids Hub: Math Quiz
- [ ] Spusti quiz, 10 otázok.
- [ ] Score sa uloží, XP +20.
- [ ] Leaderboard scoped na Kids.

## 463. 463. Kids Hub: Reading Mode
- [ ] Otvor knihu, TTS prečíta nahlas.
- [ ] Jazyk podľa locale settings.
- [ ] Bookmark uloží pozíciu.

## 464. 464. Teen Hub: Onboarding
- [ ] Vek 13–15 → Teen onboarding tour.
- [ ] Nastav avatar, záujmy.
- [ ] Privacy default = friends only.

## 465. 465. Teen Hub: Safe Chat
- [ ] DM len s overenými teen účtami.
- [ ] AI filter blokuje grooming patterns.
- [ ] Report = okamžitý suspend protistrany na review.

## 466. 466. Teen Hub: Study Groups
- [ ] Vytvor skupinu, pozvi 2 členov.
- [ ] Zdieľaj poznámky (PDF upload max 5MB).
- [ ] Mute/leave funguje.

## 467. 467. Teen Hub: Challenges
- [ ] Vyber daily challenge.
- [ ] Splň, XP +50, streak +1.
- [ ] Streak break po 48h neaktivity.

## 468. 468. Teen Hub: Career Quiz
- [ ] Dokonči 20 otázok.
- [ ] Výsledok zobrazí 3 odporúčania.
- [ ] Uloží sa do profilu.

## 469. 469. Kids/Teen: Credit Wallet
- [ ] Rodič dobije 10 € → 100 kreditov.
- [ ] Dieťa minie 5 → balance 95.
- [ ] History viditeľná rodičovi.

## 470. 470. Kids/Teen: Time Limit
- [ ] Rodič nastaví 60 min/deň.
- [ ] Po vyčerpaní → soft lock s countdown.
- [ ] Override len rodičovským PINom.

## 471. 471. Kids/Teen: Notifications
- [ ] Push len pre school hours off.
- [ ] Email digest týždenne rodičovi.
- [ ] Toggle v Settings funguje.

## 472. 472. Kids/Teen: GDPR Export
- [ ] Rodič klikne Export Data.
- [ ] Email s JSON do 24h.
- [ ] Obsahuje všetky kresby/správy/skóre.

## 473. 473. Kids/Teen: Account Delete
- [ ] Rodič potvrdí dvojstupňovo (email link).
- [ ] Anonymizácia do 7 dní.
- [ ] Confessions zostávajú anonymné.

## 474. 474. Kids/Teen: Localization
- [ ] Prepni jazyk na SK/CZ/PL/DE.
- [ ] Všetky UI stringy preložené.
- [ ] TTS hlas zmení jazyk.

## 475. 475. Final E2E v26 — Kids & Teen
- [ ] Rodič: registrácia → dobitie kreditov → vytvor child profil.
- [ ] Dieťa: Parental Gate → Fairy Castles → AI Story → XP +20.
- [ ] Teen: Safe Chat → Challenge → Career Quiz.
- [ ] Rodič: Time Limit → Notifications → Export → Delete.
- [ ] Over: žiadne dospelé reklamy, žiadne external linky, audit log v admine.

## 476. 476. Games Hub – vstup a layout
- [ ] Otvor /games – načítanie do 3 s
- [ ] Hero, kategórie, grid hier viditeľné
- [ ] Mobile 360px bez horizontal scrollu

## 477. 477. GameDistribution iframe
- [ ] Klikni hru – iframe sa načíta
- [ ] Žiadne CSP errory v console
- [ ] Fullscreen tlačidlo funguje

## 478. 478. Pokigames katalóg
- [ ] Filter podľa kategórie
- [ ] Obrázky lazy-load
- [ ] Klik otvorí hru v novej karte/iframe

## 479. 479. Y8 katalóg
- [ ] Search funguje (debounce)
- [ ] Pagination/infinite scroll
- [ ] Thumbnail fallback pri 404

## 480. 480. Obľúbené hry
- [ ] Klik srdce – pridá do favorites (RLS)
- [ ] Odhlásený – prompt na login
- [ ] Zoznam v /games/favorites

## 481. 481. Games leaderboard
- [ ] Top hráči podľa XP/skóre
- [ ] Vlastná pozícia zvýraznená
- [ ] Realtime update po skončení hry

## 482. 482. Games credits
- [ ] Premium hra vyžaduje 3–5 kreditov
- [ ] Wallet sa zníži, ledger entry
- [ ] Insufficient credits → buy modal

## 483. 483. Kids games (Parental Gate)
- [ ] Vek <13 → len safe kategória
- [ ] Parental Gate pred premium hrou
- [ ] Time limit notifikácia

## 484. 484. KitchenStars Arena – hub
- [ ] /kitchenstars-arena hero + CTA
- [ ] Sekcie: Battles, Recipes, Chefs, Leaderboard
- [ ] SEO title/description prítomné

## 485. 485. Recipe upload
- [ ] Form: title, ingredients, steps, photo
- [ ] Validácia povinných polí
- [ ] Upload do storage, RLS path = user_id

## 486. 486. Recipe feed
- [ ] Karty s autorom, likes, comments
- [ ] Filter podľa kuchyne/diéty
- [ ] Klik → detail /recipe/:id

## 487. 487. Chef profil
- [ ] Avatar, bio, recipes count, followers
- [ ] Follow tlačidlo (auth required)
- [ ] Tab: recipes / battles / reviews

## 488. 488. Battle vytvorenie
- [ ] Chef vytvorí battle (téma, deadline)
- [ ] Entry fee v kreditoch
- [ ] Battle sa zobrazí v /battles

## 489. 489. Battle hlasovanie
- [ ] 1 user = 1 hlas na battle
- [ ] Anti-cheat: nie self-vote
- [ ] Realtime score update

## 490. 490. Battle payout
- [ ] Víťaz dostane pool − 15 % provízia
- [ ] Ledger entry, notifikácia
- [ ] Stripe Connect transfer (ak KYC OK)

## 491. 491. Sponsored battle
- [ ] Brand sponzor: logo, prize
- [ ] Brand Arena tier kontrola
- [ ] Reporting pre sponzora

## 492. 492. Arena leaderboard
- [ ] Weekly/Monthly/All-time
- [ ] Top 3 badge + prize hint
- [ ] Realtime po battle ukončení

## 493. 493. Recipe komentáre + moderácia
- [ ] AI moderácia pred publish
- [ ] Report tlačidlo → admin queue
- [ ] Block usera = skryje komentáre

## 494. 494. Lokalizácia Arena
- [ ] EN default, prepni SK/DE/FR
- [ ] Kategórie/diéty preložené
- [ ] Currency = EUR všade

## 495. 495. Final E2E v27
- [ ] Kids: hraj safe hru → time limit OK
- [ ] Adult: kúp credits → premium hra → favorite
- [ ] Chef: upload recipe → battle → vote → payout

## 496. 496. Brand Arena – vstup
- [ ] /brand-arena hero + sponsor CTA
- [ ] Tiery: Bronze/Silver/Gold/Enterprise
- [ ] SEO meta + OG image

## 497. 497. Sponsor onboarding
- [ ] Brand registrácia (company, VAT)
- [ ] KYC upload + verifikácia
- [ ] Email confirmation

## 498. 498. Sponsor dashboard
- [ ] Štatistiky: impressions, clicks, ROI
- [ ] Aktívne kampane
- [ ] Export CSV

## 499. 499. Tier upgrade
- [ ] Bronze → Silver checkout (Stripe)
- [ ] Faktúra s VAT EU
- [ ] Tier badge sa zobrazí okamžite

## 500. 500. Enterprise tier API
- [ ] API key generovaný v dashboarde
- [ ] Rate limit podľa tier
- [ ] Webhook endpoint test

## 501. 501. Sponsor branding persistence
- [ ] Logo/farby uložené
- [ ] Render na sponsored kartách
- [ ] Cache invalidation po update

## 502. 502. Brand battle vytvorenie
- [ ] Sponsor vytvorí battle (prize, deadline)
- [ ] Escrow hold celej prize sumy
- [ ] Battle live v /brand-battles

## 503. 503. Brand battle moderácia
- [ ] AI scan + admin queue
- [ ] Reject = refund sponsorovi
- [ ] Approve = publish + notify

## 504. 504. Brand appeal flow
- [ ] User appeal voči rejection
- [ ] Admin review v 48h SLA
- [ ] Notifikácia o výsledku

## 505. 505. Collaboration Escrow – brief
- [ ] Brand vytvorí brief (budget, deliverables)
- [ ] Stripe drží fundy (escrow)
- [ ] Creator apply tlačidlo

## 506. 506. Collab matching
- [ ] Brand vyberie creatora
- [ ] Contract generovaný (PDF)
- [ ] Obe strany podpisujú

## 507. 507. Deliverable submission
- [ ] Creator upload (video/post link)
- [ ] Brand review do 7 dní
- [ ] Auto-approve po deadline

## 508. 508. Escrow release 80/20
- [ ] Approve → 80% creator, 20% platforma
- [ ] Stripe Connect transfer
- [ ] Ledger entry pre obe strany

## 509. 509. Dispute flow
- [ ] Brand dispute → escrow freeze
- [ ] Admin arbitráž do 5 dní
- [ ] Partial refund možný

## 510. 510. Refund 24h
- [ ] Creator zruší <24h po platbe = full refund
- [ ] Po 24h = len escrow logika
- [ ] Stripe refund event v ledger

## 511. 511. Brand leaderboard
- [ ] Top sponsori podľa spend/engagement
- [ ] Badge pre top 3
- [ ] Realtime po kampani

## 512. 512. Sponsor notifikácie
- [ ] Email + in-app pri milestone
- [ ] Priority Support pre Gold/Enterprise
- [ ] SLA timer viditeľný

## 513. 513. Lokalizácia Brand Arena
- [ ] EN default, SK/DE/FR/ES preložené
- [ ] Currency EUR fixne
- [ ] RTL test (AR)

## 514. 514. RLS audit Brand
- [ ] Sponsor vidí len svoje kampane
- [ ] Creator vidí len svoje contracts
- [ ] Anon = žiadny prístup k escrow

## 515. 515. Final E2E v28
- [ ] Brand: upgrade tier → battle → escrow → payout
- [ ] Creator: apply → deliver → release 80%
- [ ] Dispute: open → admin → refund OK

## 516. 516. Creator Subscriptions – vstup
- [ ] Creator profil má 'Subscribe' CTA
- [ ] Tiery a ceny (EUR) zobrazené
- [ ] SFW only banner viditeľný

## 517. 517. Subscribe checkout
- [ ] Stripe checkout mode=subscription
- [ ] Po platbe redirect /success
- [ ] Status badge 'Subscriber' aktívny
- [ ] Volá sa po login + každú minútu
- [ ] Vracia tier + end date
- [ ] Žiadne 401/500 v logoch

## 519. 519. Customer portal
- [ ] 'Manage subscription' otvorí Stripe portal
- [ ] Cancel = downgrade na free na konci obdobia
- [ ] Update karty funguje

## 520. 520. Subscription split 85/15
- [ ] Ledger: 85% creator, 15% platforma
- [ ] Stripe Connect transfer po invoice.paid
- [ ] Reconciliation match

## 521. 521. PPV post
- [ ] Creator vytvorí paid post (cena)
- [ ] Locked preview pre non-payera
- [ ] Unlock po Stripe payment

## 522. 522. Paid DM
- [ ] Creator nastaví DM cenu
- [ ] User pošle správu = checkout
- [ ] Po platbe DM doručené creatorovi

## 523. 523. Status badge
- [ ] Subscriber badge na komentároch
- [ ] Tier farba (Bronze/Silver/Gold)
- [ ] Hover tooltip s tier name

## 524. 524. Subscription lifecycle
- [ ] Trial → active → past_due → canceled
- [ ] Dunning emaily (3x retry)
- [ ] Win-back kupón po cancel

## 525. 525. Subscription pause
- [ ] Pause max 3 mesiace/rok
- [ ] Resume tlačidlo
- [ ] Limit dosiahnutý = disabled

## 526. 526. Tip Jar – P2P tip
- [ ] Tip tlačidlo na profile/poste
- [ ] Custom suma alebo presety (1/5/10€)
- [ ] Stripe checkout one-off

## 527. 527. Tip provízia 10%
- [ ] Recipient dostane 90%
- [ ] Ledger entry pre obe strany
- [ ] Notifikácia v reálnom čase

## 528. 528. Tip history
- [ ] Sender vidí sent tips
- [ ] Recipient vidí received tips
- [ ] CSV export

## 529. 529. Stripe Connect onboarding
- [ ] Creator klikne 'Setup payouts'
- [ ] Redirect na Stripe Express onboarding
- [ ] Status: pending → verified

## 530. 530. Stripe Connect KYC
- [ ] ID upload, bank account
- [ ] Po verifikácii badge 'Verified Creator'
- [ ] Bez KYC = payouts blokované

## 531. 531. Auto-payout cron
- [ ] Daily cron spustí pending payouts
- [ ] Min payout 10€
- [ ] Failed transfer = retry + alert

## 532. 532. Reconciliation
- [ ] Daily report: Stripe vs ledger
- [ ] Mismatch > 0.01€ = admin alert
- [ ] Manual fix tool v admin paneli

## 533. 533. Stripe disputes
- [ ] Dispute webhook → freeze creator balance
- [ ] Admin queue na reply
- [ ] Resolved = unfreeze alebo refund

## 534. 534. Tax invoicing
- [ ] VAT EU automaticky podľa krajiny
- [ ] Faktúra PDF emailom
- [ ] Download v profile/billing

## 535. 535. Final E2E v29
- [ ] Subscribe creator → PPV unlock → tip
- [ ] Creator: Connect onboarding → payout
- [ ] Cancel sub → portal → win-back email

## 536. 536. Daily streak
- [ ] Login = +1 streak day
- [ ] 24h+ gap = reset na 0
- [ ] Streak badge zobrazený v profile

## 537. 537. XP rewards
- [ ] Akcia (post/like/komentar) = XP
- [ ] Level-up notifikácia + confetti
- [ ] XP ledger v admin paneli

## 538. 538. Weekly XP leaderboard
- [ ] Top 100 týždenne
- [ ] Vlastná pozícia zvýraznená
- [ ] Reset každý pondelok 00:00 UTC

## 539. 539. Challenges
- [ ] Daily/Weekly/Monthly challenges
- [ ] Progress bar realtime
- [ ] Complete = credits + XP

## 540. 540. Lucky Wheel
- [ ] 1x denne free spin
- [ ] Výhry: credits/badges/discount
- [ ] Anti-cheat: 1 spin/24h server-side

## 541. 541. Achievements/Badges
- [ ] Badge unlock = toast + profile pin
- [ ] Hidden badges (secret)
- [ ] Share badge na wall

## 542. 542. Friend Quest
- [ ] Pozvi friend = quest invite
- [ ] Spoločné dokončenie = bonus XP
- [ ] Notifikácia accept/decline

## 543. 543. Communities – vstup
- [ ] /communities list + search
- [ ] Join/Leave tlačidlo
- [ ] Member count realtime

## 544. 544. Community detail /community/:id
- [ ] Hero, about, rules
- [ ] Posts/Events/Members taby
- [ ] Owner mod tools viditeľné

## 545. 545. Community-scoped bazaar
- [ ] Listings filtrované podľa community
- [ ] Post listing = community_id povinné
- [ ] Non-member nevidí private

## 546. 546. Community-scoped gallery
- [ ] Album zdieľaný v community
- [ ] Upload restrikcia podľa rules
- [ ] Likes/comments scoped

## 547. 547. Community moderation
- [ ] Mod môže delete post/ban member
- [ ] Audit log akcií
- [ ] Appeal flow pre banned

## 548. 548. Community events
- [ ] Vytvor event (date, location)
- [ ] RSVP attending/maybe/no
- [ ] Calendar export .ics

## 549. 549. Marketplace/Bazaar – list
- [ ] /bazaar grid s filtrom
- [ ] Sort: novinky/cena/relevance
- [ ] Pagination/infinite scroll

## 550. 550. Bazaar listing detail
- [ ] Galéria, popis, cena (EUR)
- [ ] Seller info + rating
- [ ] Buy/Message tlačidlá

## 551. 551. Bazaar checkout
- [ ] Stripe one-off checkout
- [ ] Provízia 10% pre platformu
- [ ] Ledger entry pre obe strany

## 552. 552. Bazaar disputes
- [ ] Buyer otvorí dispute < 14 dní
- [ ] Admin arbitráž
- [ ] Refund alebo release seller

## 553. 553. Seller dashboard
- [ ] Active listings, sold, revenue
- [ ] Stripe Connect payout status
- [ ] CSV export

## 554. 554. Bazaar moderácia
- [ ] AI scan pri publish
- [ ] Banned kategórie blokované
- [ ] Report listing flow

## 555. 555. Final E2E v30
- [ ] Streak 7d → badge → leaderboard top 100
- [ ] Join community → post → bazaar listing → buy
- [ ] Lucky Wheel spin → credits → spend

## 556. 556. Stories: create
- [ ] Otvor Stories → +
- [ ] Upload foto/video <60s
- [ ] Caption + sticker
- [ ] Publish → zobrazí sa v ring

## 557. 557. Stories: TTL 24h
- [ ] Over expires_at = now()+24h
- [ ] Cron stories-cleanup mažne expired
- [ ] Storage path tiež zmazaný

## 558. 558. Stories: view tracking
- [ ] Pozri cudzí story
- [ ] story_views insert raz
- [ ] Counter +1, owner vidí zoznam

## 559. 559. Stories: reactions/reply
- [ ] Emoji reaction → notif
- [ ] Reply → DM thread

## 560. 560. Stories: highlights
- [ ] Pin story do highlight
- [ ] Zostáva po 24h na profile

## 561. 561. Watch Party: vstup
- [ ] /megatalent → Watch Party
- [ ] Paywall ak nie premium
- [ ] Join room → realtime presence

## 562. 562. Watch Party: sync
- [ ] Host play/pause → guests sync ±1s
- [ ] Seek event broadcast

## 563. 563. Watch Party: chat
- [ ] Realtime chat in room
- [ ] Emoji bursts, moderation hide

## 564. 564. Watch Party: voting bonus
- [ ] Active viewers dostávajú +100k bonus votes
- [ ] Audit log

## 565. 565. Live Streaming: go-live form
- [ ] Title, kategória, thumbnail
- [ ] RTMP key generated
- [ ] Stream key skrytý, copy button

## 566. 566. Live Streaming: viewer
- [ ] /live/:id → HLS player
- [ ] Latency <5s, presence counter

## 567. 567. Live Streaming: tips počas live
- [ ] Tip widget → 90/10 split
- [ ] Animácia v overlay

## 568. 568. Live Streaming: end + VOD
- [ ] End stream → save VOD
- [ ] Auto-thumbnail, public link

## 569. 569. Localization: language switcher
- [ ] Header → 12 jazykov
- [ ] Persist v localStorage + profile

## 570. 570. Localization: fallback EN
- [ ] Chýbajúci kľúč → EN fallback
- [ ] Žiadne 'missing.key' v UI

## 571. 571. Localization: RTL (ar, he)
- [ ] dir=rtl na
- [ ] Layout zrkadlený, ikony OK

## 572. 572. Localization: currency EUR
- [ ] Všetky ceny v €
- [ ] Žiadne $ ani Kč nikde

## 573. 573. Localization: date/number format
- [ ] Intl.DateTimeFormat per locale
- [ ] Decimal separator správny

## 574. 574. Localization: SEO hreflang
- [ ] <link rel=alternate hreflang=...>
- [ ] Sitemap per jazyk

## 575. 575. Final E2E v31
- [ ] Story → Watch Party → Live → Tip → Switch jazyk → ostane prihlásený
- [ ] Žiadne console errors
- [ ] Stripe test: 4242 4242 4242 4242

## 576. 576. Bazaar: advanced filters
- [ ] Cena min/max, lokácia, kategória
- [ ] URL state persistence
- [ ] Reset filters button

## 577. 577. Bazaar: saved searches
- [ ] Save filter → notif na nové
- [ ] Mazanie saved search

## 578. 578. Bazaar: shipping options
- [ ] Osobný odber / pošta / kuriér
- [ ] Cena dopravy v checkout

## 579. 579. Bazaar: reviews
- [ ] Po nákupe → review predajcu 1-5
- [ ] Aggregate rating na profile

## 580. 580. Bazaar: report listing
- [ ] Report → moderation queue
- [ ] Auto-hide pri 3+ reportoch

## 581. 581. Jobs: zoznam
- [ ] /jobs → filter mesto/typ/plat
- [ ] Sitemap-jobs.xml dostupný

## 582. 582. Jobs: detail SEO
- [ ] JSON-LD JobPosting
- [ ] Canonical, OG image

## 583. 583. Jobs: apply flow
- [ ] Apply → upload CV
- [ ] Notif zamestnávateľovi

## 584. 584. Jobs: employer dashboard
- [ ] Create job → Stripe checkout
- [ ] Boost listing → extra fee

## 585. 585. Jobs: refund 24h
- [ ] Cancel <24h → auto refund
- [ ] >24h → manual review

## 586. 586. Education: katalóg kurzov
- [ ] /education → grid
- [ ] Filter kategória/úroveň

## 587. 587. Education: kurz detail
- [ ] Lessons list, progress %
- [ ] Enroll → checkout / free

## 588. 588. Education: video player
- [ ] HLS, watched %, resume
- [ ] Subtitles per locale

## 589. 589. Education: quiz/test
- [ ] Auto-generated z lessons
- [ ] Pass ≥70% → certifikát

## 590. 590. Education: certifikát PDF
- [ ] Download PDF, meno+date
- [ ] QR verification link

## 591. 591. Education: lektor dashboard
- [ ] Create course, lessons
- [ ] Revenue split 70/30

## 592. 592. Education: reviews
- [ ] Po dokončení → review
- [ ] Aggregate rating

## 593. 593. Education: moderation
- [ ] Report kurz → queue
- [ ] Admin hide/delete

## 594. 594. Education: i18n obsah
- [ ] Per-lesson translations
- [ ] Fallback EN

## 595. 595. Final E2E v32
- [ ] Bazaar nákup + review → Jobs apply → Course enroll + cert
- [ ] Žiadne console errors

## 596. 596. Kids Channel: vstup
- [ ] /kids → Parental Gate (math captcha)
- [ ] Po passe → kid UI

## 597. 597. Kids Channel: AI moduly
- [ ] Coloring, Dream Journal, Virtual Pet
- [ ] Credits matrix 6-12 rokov

## 598. 598. Kids Channel: filter obsahu
- [ ] Žiadne 16+ témy
- [ ] Whitelist hier only

## 599. 599. Kids Channel: časový limit
- [ ] Parent set max minutes/day
- [ ] Auto-lock po limite

## 600. 600. Kids Channel: rodičovský report
- [ ] Týždenný email rodičovi
- [ ] Aktivity log

## 601. 601. Teen Hub: vstup (13-17)
- [ ] Age gate → teen UI
- [ ] Obmedzená monetizácia

## 602. 602. Teen Hub: AI tools
- [ ] Homework helper, study planner
- [ ] Credit matrix teen

## 603. 603. Teen Hub: peer chat
- [ ] Moderated rooms only
- [ ] Auto-mute pri profanity

## 604. 604. Teen Hub: career guide
- [ ] AI quiz → odporúčania
- [ ] Linky na Education

## 605. 605. AI moderation: text
- [ ] Profanity filter realtime
- [ ] Toxicity score >0.8 → block

## 606. 606. AI moderation: image
- [ ] NSFW detect na upload
- [ ] Block + flag pre admin

## 607. 607. AI moderation: video
- [ ] Frame sampling + audio
- [ ] Auto-hide pending review

## 608. 608. AI moderation: appeals
- [ ] User appeal → 48h SLA
- [ ] Admin override + log

## 609. 609. AI moderation: cost cap
- [ ] Per-user daily limit
- [ ] Fallback na cheaper model

## 610. 610. AI moderation: audit log
- [ ] Každé rozhodnutie logged
- [ ] RLS admin-only read

## 611. 611. Parental Gate: bypass attempt
- [ ] Refresh, devtools → stále gate
- [ ] Session-based, not localStorage

## 612. 612. COPPA compliance
- [ ] No tracking <13
- [ ] Žiadne PII v analytics

## 613. 613. GDPR: kid erasure
- [ ] Parent request → full delete
- [ ] Backup tiež čistý <30d

## 614. 614. Age verification: re-prompt
- [ ] Pri zmene profilu → re-verify
- [ ] Stripe potreba 18+ check

## 615. 615. Final E2E v33
- [ ] Kid login → AI tool → time limit → parent report
- [ ] Teen flow + moderation block

## 616. 616. Admin: vstup
- [ ] /admin → has_role(admin) check
- [ ] Non-admin → 403

## 617. 617. Admin: user management
- [ ] Search, ban, unban, role assign
- [ ] Audit log každej akcie

## 618. 618. Admin: moderation queue
- [ ] Reports list, filter typ
- [ ] Approve/reject + reason

## 619. 619. Admin: refund manual
- [ ] Stripe refund button
- [ ] Reason required, log

## 620. 620. Admin: payout management
- [ ] Manual payout trigger
- [ ] Hold/release Stripe Connect

## 621. 621. Admin: feature flags
- [ ] Toggle features per env
- [ ] Realtime propagation

## 622. 622. Admin: broadcast notif
- [ ] Send push/email all users
- [ ] Segment by role/locale

## 623. 623. Analytics: DAU/MAU
- [ ] Dashboard live counts
- [ ] Retention cohort table

## 624. 624. Analytics: revenue
- [ ] MRR, ARR, ARPU per modul
- [ ] Stripe reconciliation match

## 625. 625. Analytics: funnel
- [ ] Signup → first purchase
- [ ] Drop-off per step

## 626. 626. Analytics: AI cost
- [ ] Credits used per modul
- [ ] Cost vs revenue margin

## 627. 627. Analytics: top creators
- [ ] Leaderboard by revenue
- [ ] Payout status

## 628. 628. Security: RLS audit
- [ ] Všetky public tables enabled RLS
- [ ] Žiadne public.* bez policy

## 629. 629. Security: SQL injection scan
- [ ] Param queries only
- [ ] No string concat in RPC

## 630. 630. Security: XSS scan
- [ ] dangerouslySetInnerHTML audit
- [ ] sanitizeHtml všade

## 631. 631. Security: CORS
- [ ] Edge functions allowlist
- [ ] No wildcard origin v prod

## 632. 632. Security: rate limit
- [ ] Per-IP a per-user
- [ ] 429 response na flood

## 633. 633. Security: secrets rotation
- [ ] Stripe, Resend, AI keys
- [ ] Quarterly rotation log

## 634. 634. Security: pen test report
- [ ] External audit summary
- [ ] All criticals fixed

## 635. 635. Final E2E v34
- [ ] Admin ban → user unable login
- [ ] Refund → Stripe + ledger sync
- [ ] Analytics match raw DB

## 636. 636. Perf: Lighthouse mobile
- [ ] Performance ≥85, A11y ≥95
- [ ] SEO 100, Best practices ≥95

## 637. 637. Perf: LCP <2.5s
- [ ] Hero image preload
- [ ] Critical CSS inline

## 638. 638. Perf: CLS <0.1
- [ ] Image width/height set
- [ ] Font-display: swap

## 639. 639. Perf: INP <200ms
- [ ] No long tasks >50ms
- [ ] Debounce inputs

## 640. 640. Perf: bundle size
- [ ] Main chunk <300KB gz
- [ ] Route-level code split

## 641. 641. Perf: image opt
- [ ] WebP/AVIF, lazy loading
- [ ] Responsive srcset

## 642. 642. PWA: install prompt
- [ ] beforeinstallprompt fired
- [ ] Install button visible

## 643. 643. PWA: offline mode
- [ ] Service worker cache
- [ ] offline.html fallback

## 644. 644. PWA: manifest
- [ ] icons 192/512, theme_color
- [ ] start_url, display: standalone

## 645. 645. PWA: push notif
- [ ] Permission prompt
- [ ] Push doručené aj zavretá app

## 646. 646. SEO: sitemap
- [ ] sitemap-index.xml platný
- [ ] Submitted to Search Console

## 647. 647. SEO: meta tags
- [ ] Title <60, desc <160 per route
- [ ] OG image 1200x630

## 648. 648. SEO: structured data
- [ ] JSON-LD valid (rich results test)
- [ ] Org, WebSite, JobPosting

## 649. 649. SEO: robots.txt
- [ ] Allow crawl, disallow /admin
- [ ] Sitemap reference

## 650. 650. SEO: canonical
- [ ] Per route canonical tag
- [ ] Žiadne duplicates

## 651. 651. A11y: keyboard nav
- [ ] Tab order logický
- [ ] Focus visible všade

## 652. 652. A11y: screen reader
- [ ] aria-labels na ikonách
- [ ] Landmarks (main, nav, footer)

## 653. 653. A11y: contrast
- [ ] WCAG AA ≥4.5:1
- [ ] Žiadne low-contrast warnings

## 654. 654. A11y: forms
- [ ] label for každý input
- [ ] Error messages aria-live

## 655. 655. Final E2E v35
- [ ] Lighthouse run all green
- [ ] PWA install + offline
- [ ] axe-core 0 violations

## 656. 656. Regression: auth full
- [ ] Signup → email confirm → login → logout
- [ ] Reset password flow

## 657. 657. Regression: payments all
- [ ] Subscription, one-off, tip, escrow
- [ ] Refund flows OK

## 658. 658. Regression: wall
- [ ] Post, like, comment, share, bookmark
- [ ] Realtime updates

## 659. 659. Regression: DM unified
- [ ] Send, receive, paid DM, mute
- [ ] Žiadny legacy endpoint

## 660. 660. Regression: Megatalent
- [ ] Submit → vote → watch party → payout 80/20

## 661. 661. Regression: Brand Arena
- [ ] Battle create → vote → leaderboard → payout

## 662. 662. Regression: Creator Subs
- [ ] Subscribe → PPV → cancel → split 85/15

## 663. 663. Regression: Kids/Teen
- [ ] Parental Gate → AI tool → time limit

## 664. 664. Regression: Communities
- [ ] Create → join → community bazaar

## 665. 665. Regression: Gamification
- [ ] Streak, XP, lucky wheel, friend quest

## 666. 666. Launch: env vars prod
- [ ] Všetky secrets nastavené
- [ ] Stripe LIVE keys, not test

## 667. 667. Launch: DNS + SSL
- [ ] uniqueapp.fun + www → 200
- [ ] HTTPS redirect, HSTS

## 668. 668. Launch: backups
- [ ] Daily DB backup
- [ ] Restore tested <1h

## 669. 669. Launch: monitoring
- [ ] Sentry/error tracking on
- [ ] Uptime monitor + alerts

## 670. 670. Launch: legal
- [ ] TOS, Privacy, Cookies live
- [ ] GDPR consent banner

## 671. 671. Launch: support
- [ ] help@ email funkčné
- [ ] Priority support SLA dashboard

## 672. 672. Launch: social proof
- [ ] Landing testimonials
- [ ] OG preview test (FB, X, LinkedIn)

## 673. 673. Launch: payment reconciliation
- [ ] Stripe ↔ DB ledger match
- [ ] Daily cron pass

## 674. 674. Launch: load test
- [ ] k6/Artillery 1000 concurrent
- [ ] p95 <500ms, 0 errors

## 675. 675. GO LIVE v36
- [ ] Final smoke E2E na prod
- [ ] Announce to users
- [ ] Launch confirmed (GO)

## 676. 676. Monitoring: uptime
- [ ] UptimeRobot/Pingdom 1min interval
- [ ] Alert email+SMS pri downtime

## 677. 677. Monitoring: error rate
- [ ] Sentry dashboard <0.5% errors
- [ ] Spike alert >2%

## 678. 678. Monitoring: p95 latency
- [ ] Edge fn p95 <500ms
- [ ] DB query p95 <100ms

## 679. 679. Monitoring: Stripe webhook
- [ ] Delivery rate 100%
- [ ] Retry queue prázdny

## 680. 680. Monitoring: AI cost
- [ ] Daily spend alert >limit
- [ ] Per-modul breakdown

## 681. 681. Monitoring: DB connections
- [ ] Pooler usage <80%
- [ ] No connection leaks

## 682. 682. Monitoring: storage growth
- [ ] Storage GB trend
- [ ] Cleanup cron beží

## 683. 683. Incident: runbook
- [ ] On-call rotation defined
- [ ] Severity P0/P1/P2 procedures

## 684. 684. Incident: rollback
- [ ] Last 5 deploys revertable
- [ ] Tested rollback <10min

## 685. 685. Incident: status page
- [ ] status.uniqueapp.fun live
- [ ] Auto-updates from monitors

## 686. 686. Post-launch: user feedback
- [ ] In-app NPS prompt
- [ ] Feedback inbox triage

## 687. 687. Post-launch: bug triage
- [ ] Daily review nových reportov
- [ ] Critical → hotfix <24h

## 688. 688. Post-launch: cohort retention
- [ ] D1, D7, D30 tracking
- [ ] Churn analysis weekly

## 689. 689. Post-launch: revenue tracking
- [ ] MRR growth dashboard
- [ ] Refund rate <5%

## 690. 690. Post-launch: A/B testing
- [ ] Feature flag experiments
- [ ] Statistical significance gate

## 691. 691. Post-launch: SEO ranking
- [ ] Semrush weekly report
- [ ] Top 10 keywords monitor

## 692. 692. Post-launch: social listening
- [ ] Mentions monitor (X, Reddit)
- [ ] Reply SLA <2h

## 693. 693. Post-launch: weekly review
- [ ] Metrics review meeting
- [ ] Action items tracked

## 694. 694. Post-launch: backup verify
- [ ] Monthly restore drill
- [ ] RTO/RPO documented

## 695. 695. Final E2E v37
- [ ] Simulate incident → alert → fix → postmortem
- [ ] All monitors green

## 696. 696. Referral: generate link
- [ ] Profile → unique referral code
- [ ] Copy/share UTM tagged

## 697. 697. Referral: signup attribution
- [ ] Nový user cez link → referrer_id set
- [ ] Cookie 30 dní

## 698. 698. Referral: payout
- [ ] Po prvom paid action → 10% komisia
- [ ] Stripe Connect transfer

## 699. 699. Referral: fraud detect
- [ ] Same IP/device → flag
- [ ] Self-referral block

## 700. 700. Referral: leaderboard
- [ ] Top 100 referrers
- [ ] Mesačné odmeny tier

## 701. 701. Referral: tiers
- [ ] Bronze/Silver/Gold/Platinum
- [ ] Vyššie % pri vyššom tier

## 702. 702. Email: welcome series
- [ ] Day 0, 1, 3, 7 sekvencia
- [ ] Resend delivery 99%+

## 703. 703. Email: transactional
- [ ] Receipt, refund, payout
- [ ] DKIM/SPF/DMARC passing

## 704. 704. Email: digest weekly
- [ ] Personalized content
- [ ] Unsubscribe link required

## 705. 705. Email: winback
- [ ] Inaktívny 30d → kupón
- [ ] 60d → final offer

## 706. 706. Email: dunning
- [ ] Failed payment → 3 retries
- [ ] Email sekvencia + grace period

## 707. 707. Push notif: opt-in
- [ ] Soft prompt before native
- [ ] Persist preferences

## 708. 708. Push notif: segmentation
- [ ] Per locale, per modul
- [ ] A/B subject test

## 709. 709. Growth: viral loops
- [ ] Share post → preview meta
- [ ] Invite friends incentive

## 710. 710. Growth: SEO content
- [ ] Blog/landing pages per keyword
- [ ] Internal linking strategy

## 711. 711. Growth: paid ads
- [ ] Meta/Google Pixel tracking
- [ ] Conversion API server-side

## 712. 712. Growth: affiliate program
- [ ] Public signup → dashboard
- [ ] W-9/W-8BEN tax forms

## 713. 713. Growth: influencer
- [ ] Promo codes trackable
- [ ] Performance dashboard

## 714. 714. Growth: PR kit
- [ ] Press page + assets
- [ ] Brand guidelines PDF

## 715. 715. Final E2E v38
- [ ] Referral link → signup → purchase → komisia → email receipt
- [ ] Push notif doručené

## 716. 716. PWA install prompt (iOS)
- [ ] Safari → Share → Add to Home Screen
- [ ] Ikona + splash screen správne
- [ ] Standalone mode (žiadny browser chrome)

## 717. 717. PWA install prompt (Android)
- [ ] Chrome beforeinstallprompt event
- [ ] A2HS banner sa zobrazí
- [ ] Manifest.json validný

## 718. 718. Service worker offline
- [ ] Vypni sieť → offline.html sa zobrazí
- [ ] Cached assets dostupné
- [ ] SW update notifikácia

## 719. 719. Push notifikácie — opt-in
- [ ] Permission prompt po prihlásení
- [ ] Token uložený v DB
- [ ] Test push doručený

## 720. 720. Deep links — DM
- [ ] unique://dm/:userId otvorí konverzáciu
- [ ] Universal link (iOS) funguje
- [ ] App Links (Android) overené

## 721. 721. Deep links — Megatalent
- [ ] unique://megatalent/:id otvorí stream
- [ ] Fallback na web ak app nie je
- [ ] OG preview správny

## 722. 722. Deep links — Brand Arena
- [ ] unique://brand/:slug funguje
- [ ] Tracking parametre zachované
- [ ] Referral attribution OK

## 723. 723. Native share API
- [ ] navigator.share() funguje na mobile
- [ ] Fallback copy-to-clipboard
- [ ] Share count tracked

## 724. 724. Camera access
- [ ] getUserMedia povolenie
- [ ] Photo upload z kamery
- [ ] Permission denied handling

## 725. 725. Geolocation
- [ ] Permission prompt
- [ ] Lat/long uložené
- [ ] Denied → manual location input

## 726. 726. Biometric auth (WebAuthn)
- [ ] FaceID/TouchID prompt
- [ ] Passkey registration
- [ ] Login bez hesla

## 727. 727. Haptic feedback
- [ ] navigator.vibrate() na akciách
- [ ] iOS Taptic Engine cez Capacitor
- [ ] Settings toggle

## 728. 728. Orientation lock
- [ ] Portrait only na key flows
- [ ] Landscape pre video
- [ ] Rotation handled gracefully

## 729. 729. Safe area insets
- [ ] env(safe-area-inset-*) na notchy
- [ ] Bottom nav nad home indicator
- [ ] Status bar tint správny

## 730. 730. Pull-to-refresh
- [ ] Wall/feed refresh gesture
- [ ] Loading indicator
- [ ] Disabled na non-scroll views

## 731. 731. Background sync
- [ ] Offline posty sa pošlú po online
- [ ] Queue persistuje cez restart
- [ ] Retry s exponential backoff

## 732. 732. App badge count
- [ ] Unread DM/notif na ikone
- [ ] Clear po otvorení
- [ ] iOS/Android parita

## 733. 733. Native bridges (Capacitor)
- [ ] Plugin calls fungujú
- [ ] Error handling pre missing native
- [ ] Web fallback

## 734. 734. App store readiness
- [ ] Screenshoty 6.7"/6.5"/5.5"
- [ ] Privacy policy URL
- [ ] Age rating 17+ (iOS) / Mature (Android)

## 735. 735. Final E2E v39
- [ ] Install PWA → push opt-in → deep link → share → biometric login → offline post → online sync

## 736. 736. App Store Connect — bundle ID
- [ ] com.unique.app zaregistrované
- [ ] Provisioning profile valid
- [ ] Certifikáty distribution
- [ ] Archive → upload cez Xcode/Transporter
- [ ] Processing OK (<1h)
- [ ] Internal testers pozvaní
- [ ] Data collection deklarované
- [ ] Tracking permission (ATT) prompt
- [ ] Privacy nutrition labels
- [ ] Demo účet (beata.vikorova@yandex.com)
- [ ] Stripe test card v poznámkach
- [ ] Feature walkthrough video

## 740. 740. Google Play Console — listing
- [ ] Package name com.unique.app
- [ ] Signing key (Play App Signing)
- [ ] Internal testing track

## 741. 741. Android — Data safety form
- [ ] Vyplnené všetky kategórie
- [ ] Encryption in transit declared
- [ ] User data deletion URL

## 742. 742. Android — Target API 34+
- [ ] Kompilácia voči najnovšej SDK
- [ ] Permissions minimalizované
- [ ] Foreground service types

## 743. 743. ASO — app name + subtitle
- [ ] "Unique — Creator Platform" (30 znakov)
- [ ] Subtitle s keywords (30 znakov)
- [ ] Lokalizované do 12 jazykov

## 744. 744. ASO — keywords
- [ ] 100 znakov iOS keywords field
- [ ] Konkurenčná analýza (Sensor Tower)
- [ ] Long-tail variants

## 745. 745. ASO — screenshoty
- [ ] 6.7" iPhone (1290x2796) ×8
- [ ] 6.5" iPhone (1242x2688) ×8
- [ ] iPad 12.9" (2048x2732) ×8

## 746. 746. ASO — preview video
- [ ] 15-30s app preview .mov
- [ ] Bez voiceoveru (Apple guideline)
- [ ] Hook v prvých 3s

## 747. 747. ASO — ikona
- [ ] 1024x1024 PNG bez alpha
- [ ] Adaptive icon (Android) 432x432
- [ ] Žiadny text v ikone

## 748. 748. Crash reporting — Sentry init
- [ ] DSN nakonfigurovaný
- [ ] Source maps uploadnuté
- [ ] Release tag = build version

## 749. 749. Crash reporting — symbolication
- [ ] dSYM nahraté pre iOS
- [ ] ProGuard mapping pre Android
- [ ] Stack traces čitateľné

## 750. 750. Crash reporting — alerts
- [ ] Slack webhook na new issues
- [ ] Crash-free users >99.5%
- [ ] Daily digest

## 751. 751. Performance — Firebase Perf
- [ ] Cold start <2s
- [ ] Screen render time tracked
- [ ] Network latency p95 <1s

## 752. 752. Analytics — events parita
- [ ] Web a mobile rovnaké event names
- [ ] User ID consistent cross-platform
- [ ] GA4 + Mixpanel

## 753. 753. In-app updates
- [ ] Force update flow (Android)
- [ ] iOS soft prompt cez Sheet
- [ ] Min supported version check

## 754. 754. Rating prompt
- [ ] SKStoreReviewController po 3+ session
- [ ] Android In-App Review API
- [ ] Max 3× za rok (Apple limit)

## 755. 755. Final E2E v40
- [ ] TestFlight install → onboarding → push → IAP → crash → Sentry issue → fix → update prompt

## 763. 763. Android Billing — produktové ID parita
- [ ] Play Console productId == StoreKit productId == Stripe price metadata.

## 764. 764. Android Billing — license tester nákup
- [ ] License tester účet dokončí nákup; purchase token zaregistrovaný.

## 765. 765. Android Billing — acknowledgePurchase
- [ ] Server volá acknowledgePurchase do 3 dní; inak refund.

## 766. 766. Android Billing — subscription upgrade
- [ ] replaceSkusProration mode CHARGE_PRORATED_PRICE funguje.

## 767. 767. Android Billing — pause/resume
- [ ] Pause subscription (kde povolené) a resume obnoví fakturáciu.

## 768. 768. Android Billing — hold state
- [ ] Account hold po zlyhanej platbe; user vidí banner s retry.

## 769. 769. Server — receipt validation iOS
- [ ] Edge function /verify-apple-receipt vráti subscription_end; uloží sa do DB.

## 770. 770. Server — Google Play Developer API
- [ ] purchases.subscriptionsv2.get vráti stav; cron sync každú hodinu.

## 771. 771. Webhook — App Store Server Notifications V2
- [ ] DID_RENEW, DID_FAIL_TO_RENEW, EXPIRED, REFUND eventy spracované.

## 772. 772. Webhook — Google RTDN (Pub/Sub)
- [ ] SUBSCRIPTION_RENEWED, SUBSCRIPTION_CANCELED notifikácie aktualizujú DB.

## 773. 773. Parita cien
- [ ] iOS/Android/Stripe ceny pre EU v EUR sú identické (vrátane VAT zobrazenia).

## 774. 774. Entitlement gate
- [ ] Klient číta jediný entitlement zdroj (Supabase); IAP aj Stripe predplatné odomknú rovnaké

## 775. 775. Final E2E v41
- [ ] Nákup na iOS → restore na Androide cez rovnaký účet → entitlement aktívny; cancel →

## 776. 776. Alt texty obrázkov
- [ ] Všetky [img]lt;img[img]gt; a avatary majú zmysluplný alt; dekoratívne majú alt="".

## 777. 777. Icon-only buttons aria-label
- [ ] Lucide ikony v tlačidlách majú aria-label (like, share, close, menu).

## 778. 778. Form labels
- [ ] Každý input má <label> alebo aria-label (login, search, comment, DM).

## 779. 779. Kontrast textu 4.5:1
- [ ] Body text vs background spĺňa AA; over Lighthouse na hlavných stránkach.

## 780. 780. Kontrast UI 3:1
- [ ] Buttony, ikony, focus ringy majú minimálne 3:1 voči pozadiu.

## 781. 781. Focus visible
- [ ] Všetky interaktívne prvky majú viditeľný focus ring (Tab cyklus).

## 782. 782. Keyboard navigácia
- [ ] Cely flow (login → feed → DM → checkout) ovládateľný len klávesnicou.

## 783. 783. Skip to content link
- [ ] Prvý Tab odhalí 'Preskočiť na obsah' anchor.

## 784. 784. Modal focus trap
- [ ] Dialógy (Radix) zachytávajú focus, Esc zatvára, focus sa vráti na trigger.

## 785. 785. Screen reader — VoiceOver iOS
- [ ] Hlavné akcie (Post, Like, Tip, Subscribe) sú správne oznámené.

## 786. 786. Screen reader — TalkBack Android
- [ ] Navigácia po hubs funguje; landmarks oznámené.

## 787. 787. Screen reader — NVDA Windows
- [ ] Formuláre a chyby čítané; aria-describedby pre hint texty.

## 788. 788. Live regions
- [ ] Toast notifikácie a chat správy majú aria-live=polite.

## 789. 789. Headings hierarchia
- [ ] Žiadne preskočené úrovne; jeden <h1> na stránku.

## 790. 790. Landmarks
- [ ] <header>, <nav>, <main>, <footer> prítomné; <main> unikátny.

## 791. 791. Tap targets 44x44
- [ ] Mobilné ikony a tlačidlá spĺňajú minimum (WCAG 2.5.5).

## 792. 792. Reduced motion
- [ ] prefers-reduced-motion vypína parallax/auto-play animácie.

## 793. 793. Language atribút
- [ ] <html lang> sa mení podľa zvoleného jazyka (12 jazykov).

## 794. 794. Error identifikácia
- [ ] Chyby formulárov sú textové, nie len farbou; aria-invalid set.

## 795. 795. Final E2E v42
- [ ] Lighthouse Accessibility ≥ 95 na /, /feed, /megatalent, /checkout.

## 796. 796. Default jazyk = English
- [ ] Nový anonymný visit zobrazí EN bez ohľadu na Accept-Language.

## 797. 797. Language selector — 12 jazykov
- [ ] Zoznam: EN, SK, CS, DE, FR, ES, IT, PL, HU, UK, RU, AR. Výber sa uloží do localStorage.

## 798. 798. Perzistencia jazyka
- [ ] Po reload a re-loginu zostáva zvolený jazyk; profile.locale sa synchronizuje.

## 799. 799. Preklad UI stringov
- [ ] Žiadne 'missing key' alebo 'i18n.t(...)' nestringy vo zvolenom jazyku.

## 800. 800. Pluralizácia
- [ ] 1 like vs 2 likes vs 5 likes (SK/CS/PL/RU/UK majú viac foriem).

## 801. 801. RTL — Arabic layout
- [ ] Po prepnutí na AR sa dir="rtl" aplikuje na <html>; sidebar, ikony a chevrony sa zrkadlia.

## 802. 802. RTL — zrkadlenie ikôn
- [ ] Šípky späť/vpred, chat send a chevrony rešpektujú logical properties (ms/me, ps/pe).

## 803. 803. RTL — mixed content
- [ ] Latinka v arabskej vete (URL, @handle) sa zobrazí korektne, bez prerušenia BiDi.

## 804. 804. Mena EUR vždy
- [ ] Všetky ceny v € bez ohľadu na jazyk (€9,99 SK/CS/DE vs €9.99 EN).

## 805. 805. Formát čísel
- [ ] Intl.NumberFormat podľa locale: 1 234,56 (SK) vs 1,234.56 (EN) vs ١٬٢٣٤٫٥٦ (AR).

## 806. 806. Formát dátumu
- [ ] 20. jún 2026 (SK) vs June 20, 2026 (EN) vs 20/06/2026 (FR) — žiadny ISO leak v UI.

## 807. 807. Relatívny čas
- [ ] 'pred 2 hodinami' / '2 hours ago' / 'hace 2 horas' v každom jazyku.

## 808. 808. Časové pásmo
- [ ] Posty a DM časy v lokálnom TZ usera, nie v UTC.

## 809. 809. Stripe Checkout locale
- [ ] Stripe stránka sa otvorí v jazyku usera (locale param).

## 810. 810. Emaily v zvolenom jazyku
- [ ] Welcome, reset password, payout notification v jazyku profile.locale.

## 811. 811. AI moduly — jazyk výstupu
- [ ] Kids AI, ProClass a chat odpovedajú v jazyku usera (system prompt).

## 812. 812. Validácia formulárov
- [ ] Chybové hlášky preložené (email invalid, password short, atď.).

## 813. 813. SEO — hreflang
- [ ] <link rel="alternate" hreflang> pre hlavné jazyky na public stránkach.

## 814. 814. Diakritika a fonty
- [ ] Č, Š, ž, ó, ä, ü, ñ, é, а, я, ‫ا‬, ‫ — ع‬žiadne tofu boxy ani fallback fonty.

## 815. 815. Final E2E v43
- [ ] Prejdi flow login→feed→tip→checkout v EN, SK, DE, AR — bez breakov, ceny v EUR.

## 816. 816. LCP < 2.5s (homepage)
- [ ] Otvor / v Chrome DevTools → Lighthouse → Performance (Mobile).
- [ ] LCP musí byť pod 2.5s na 4G throttling.
- [ ] LCP element = hero video poster alebo H1, nie skrytý obrázok.

## 817. 817. CLS < 0.1
- [ ] Skontroluj cumulative layout shift v Lighthouse.
- [ ] Fonty majú font-display: swap a žiadny FOIT skok.
- [ ] Obrázky majú explicitné width/height alebo aspect-ratio.

## 818. 818. INP < 200ms
- [ ] DevTools → Performance → Record → klik na 5 tlačidiel.
- [ ] Interaction to Next Paint musí byť pod 200ms.
- [ ] Žiadne dlhé tasky > 50ms pri klikoch.

## 819. 819. FCP < 1.8s
- [ ] First Contentful Paint pod 1.8s na 4G.
- [ ] Critical CSS inlined, žiadne render-blocking JS.

## 820. 820. TTFB < 600ms
- [ ] Network tab → Document request → TTFB pod 600ms.
- [ ] Cloudflare cache hit pre statické routes.

## 821. 821. Bundle size
- [ ] npm run build → dist/assets/index-*.js pod 500KB gzip.
- [ ] Žiadny chunk > 1MB unminified.
- [ ] scripts/bundle-report.mjs prejde bez warningu.

## 822. 822. Code splitting
- [ ] Network tab pri navigácii na /megatalent → lazy chunk sa načíta.
- [ ] Admin routes sú v samostatnom chunku.

## 823. 823. Image optimization
- [ ] Hero obrázky vo WebP/AVIF formáte.
- [ ] <img loading="lazy"> pre below-the-fold.
- [ ] fetchpriority="high" iba na LCP obrázku.

## 824. 824. Video lazy loading
- [ ] Hero videá majú poster a preload="none" alebo "metadata".
- [ ] Autoplay iba ak je viewport visible (IntersectionObserver).

## 825. 825. Font loading
- [ ] Lobster Two preloaded cez <link rel="preload" as="font">.
- [ ] font-display: swap, žiadny FOIT.

## 826. 826. Service worker cache
- [ ] DevTools → Application → Service Workers → aktívny.
- [ ] Offline mode → /offline.html sa zobrazí.
- [ ] Cache strategy: stale-while-revalidate pre API.

## 827. 827. PWA install prompt
- [ ] Mobile Chrome → menu → Install app sa zobrazí.
- [ ] manifest.webmanifest validný, icons 192/512px.

## 828. 828. Lighthouse score
- [ ] Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] GitHub Actions lighthouse.yml prejde zelene.

## 829. 829. Database query perf
- [ ] Admin → Vitals → žiadny query > 500ms.
- [ ] Feed query pod 200ms (cached).

## 830. 830. Realtime latency
- [ ] Otvor wall v 2 tabs → like v tab1 → tab2 update do 1s.
- [ ] DM message delivery do 500ms.

## 831. 831. Edge function cold start
- [ ] Supabase edge function prvý call pod 2s.
- [ ] Subsequent calls pod 500ms.

## 832. 832. Memory leaks
- [ ] DevTools → Memory → Heap snapshot pred/po navigácii.
- [ ] Žiadny rast > 10MB po 10 navigáciách.

## 833. 833. Mobile 3G test
- [ ] DevTools → Network → Slow 3G → / sa načíta pod 5s.
- [ ] Skeleton loaders sa zobrazia okamžite.

## 834. 834. Web Vitals tracking
- [ ] src/utils/webVitals.ts loguje do analytics.
- [ ] Admin → Vitals dashboard zobrazuje p75 hodnoty.

## 835. 835. Final E2E v44 — Performance audit
- [ ] Spusti Lighthouse CI lokálne: npx lhci autorun.
- [ ] Všetky 4 skóre ≥ 90.
- [ ] LCP/CLS/INP v zelenej zóne.
- [ ] Bundle pod limitom, žiadne console errors.

## 836. 836. Color contrast 4.5:1
- [ ] axe DevTools → scan / → žiadne color-contrast violations.
- [ ] text-foreground na bg-background prejde AA.
- [ ] Žiadny text-gray-300 alebo opacity/50 na svetlom pozadí.

## 837. 837. Keyboard navigation
- [ ] Tab cez celú homepage → focus visible na každom prvku.
- [ ] Žiadny focus trap mimo modálov.
- [ ] Esc zatvorí Dialog/Sheet/Popover.

## 838. 838. Focus indicator
- [ ] focus-visible:ring-2 ring-primary na všetkých interaktívnych prvkoch.
- [ ] Žiadny outline: none bez náhrady.

## 839. 839. Skip to content link
- [ ] Tab z URL baru → prvý focus = 'Skip to main content'.
- [ ] Enter skočí na <main>.

## 840. 840. Single <main> per page
- [ ] DevTools → Elements → presne 1× <main> na route.
- [ ] Wrapper v layoute s <Outlet/>, nie v každej page.

## 841. 841. Heading hierarchy
- [ ] Lighthouse → žiadny heading-order warning.
- [ ] H1 raz na stránke, H2/H3 nevynechané úrovne.

## 842. 842. Button accessible name
- [ ] axe → žiadny button-name violation.
- [ ] Icon-only Button má aria-label.
- [ ] <Button size="icon" aria-label="Close"><X/></Button>

## 843. 843. Link accessible name
- [ ] Žiadny prázdny <a>, žiadne 'click here'.
- [ ] Linky s ikonou majú aria-label alebo sr-only text.

## 844. 844. Form labels
- [ ] Každý <Input>, <Select>, <Textarea> má <Label htmlFor>.
- [ ] Login form: email + password labels viditeľné.

## 845. 845. Form error messages
- [ ] Invalid email → chyba s aria-describedby + role="alert".
- [ ] Screen reader prečíta error pri submit.

## 846. 846. Image alt text
- [ ] Všetky <img> majú alt (prázdny pre dekoratívne).
- [ ] Avatar má alt="{user.name}".
- [ ] Hero obrázky popisný alt, nie 'image123.jpg'.

## 847. 847. Video captions
- [ ] Hero videá majú <track kind="captions"> alebo sú dekoratívne (muted, no audio info).

## 848. 848. ARIA landmarks
- [ ] <header>, <nav>, <main>, <footer> semantické.
- [ ] Žiadne nadbytočné role="banner" na <header>.

## 849. 849. Dialog/Modal a11y
- [ ] shadcn Dialog → focus trap aktívny.
- [ ] Esc zatvorí, focus sa vráti na trigger.
- [ ] aria-labelledby a aria-describedby správne.

## 850. 850. Toast notifications
- [ ] Sonner toast → role="status" alebo aria-live="polite".
- [ ] Screen reader oznámi 'Comment posted'.

## 851. 851. Touch targets 44×44px
- [ ] Mobile 360px viewport → všetky tlačidlá ≥ 44×44.
- [ ] size="icon" + min-h-11 min-w-11 pre primary actions.

## 852. 852. Reduced motion
- [ ] OS → Reduce Motion ON → animácie sa vypnú alebo skrátia.
- [ ] prefers-reduced-motion media query rešpektovaný.

## 853. 853. Screen reader (NVDA/VoiceOver)
- [ ] NVDA → prejdi homepage → všetok obsah čitateľný.
- [ ] Wall post: autor, čas, obsah, like count správne oznámené.

## 854. 854. Language attribute
- [ ] <html lang="{i18n.lang}"> sa mení pri prepnutí jazyka.
- [ ] Default lang="en".

## 855. 855. Final E2E v45 — Full a11y audit
- [ ] axe DevTools full scan na 5 hlavných routes → 0 violations.
- [ ] Lighthouse Accessibility ≥ 95 na všetkých routes.
- [ ] Keyboard-only user journey: login → post → comment → logout.
- [ ] NVDA smoke test bez blokujúcich problémov.

## 856. 856. RLS na všetkých public tabuľkách
- [ ] Supabase → Database → Tables → každá tabuľka má RLS enabled.
- [ ] supabase linter → 0 'rls_disabled_in_public' chýb.

## 857. 857. RLS policies — user_roles
- [ ] user_roles tabuľka NIE je read-write z klienta.
- [ ] has_role() je SECURITY DEFINER s search_path=public.
- [ ] Žiadny client-side admin check (localStorage/sessionStorage).

## 858. 858. Profile data isolation
- [ ] Účet A nesmie čítať email/phone účtu B.
- [ ] profiles_public view obsahuje len safe fields.

## 859. 859. Wall post privacy
- [ ] Private post viditeľný len autorovi + friends.
- [ ] Public post viditeľný anonymne (bez auth).
- [ ] Žiadny PII leak v anonymnom feede.

## 860. 860. DM bezpečnosť
- [ ] Účet A nesmie čítať conversations účtu B.
- [ ] Realtime topic restrictions enforced (test cross-user subscribe).

## 861. 861. XSS prevention
- [ ] Wall post: <script>alert(1)</script> → escapnutý ako text.
- [ ] sanitizeHtml() použitý pre user HTML content.
- [ ] Žiadny dangerouslySetInnerHTML bez sanitizácie.

## 862. 862. CSRF / SameSite cookies
- [ ] Supabase auth cookies majú SameSite=Lax.
- [ ] Stripe checkout cez signed session, nie cez GET form.

## 863. 863. Storage signed URLs
- [ ] Private bucket súbory cez signed URL s expiry.
- [ ] Žiadny public URL pre KYC dokumenty.

## 864. 864. Edge function authentication
- [ ] Funkcie s verify_jwt=true vyžadujú Bearer token.
- [ ] Anonymný call → 401.

## 865. 865. SQL injection
- [ ] Žiadne raw string concat v RPC funkciách.
- [ ] Parametrizované queries cez Supabase client.

## 866. 866. Rate limiting
- [ ] Login: 5 pokusov / 15min → blokované.
- [ ] AI tool calls: limit per user/day enforced.
- [ ] Edge function má per-IP rate limit.

## 867. 867. Password policy
- [ ] Min 8 znakov, supabase auth config enforced.
- [ ] Žiadny password v logoch.

## 868. 868. Session expiry
- [ ] Inactive 7 dní → re-auth required.
- [ ] Refresh token rotation aktívna.

## 869. 869. Recent auth pre citlivé akcie
- [ ] Zmena emailu/hesla/withdrawal → requireRecentAuth() <5min.

## 870. 870. GDPR — data export
- [ ] Settings → Export my data → JSON dump všetkých user dát.
- [ ] Doručenie do 30 dní.

## 871. 871. GDPR — right to erasure
- [ ] Settings → Delete account → soft delete + 30d grace.
- [ ] Po grace: hard delete cez gdpr-erasure edge function.
- [ ] PII anonymizované v zostávajúcich postoch.

## 872. 872. Cookie consent
- [ ] Prvý visit → cookie banner.
- [ ] Reject → žiadne analytics/marketing cookies.

## 873. 873. Content Security Policy
- [ ] public/_headers obsahuje CSP header.
- [ ] Žiadne 'unsafe-inline' scripts (okrem hashov).

## 874. 874. Stripe webhook signature
- [ ] Webhook overuje stripe-signature header.
- [ ] Replay attack: starý event → ignored.

## 875. 875. Final E2E v46 — Security audit
- [ ] supabase linter → 0 ERROR, 0 WARN.
- [ ] Lighthouse Best Practices ≥ 95.
- [ ] Manual pentest: cross-user RLS bypass attempt → fail.
- [ ] XSS payload v 5 input fields → escapnutý.
- [ ] Security memory doc aktualizovaný.

## 876. 876. Page view tracking
- [ ] Otvor 5 routes → analytics dashboard zaznamená každý view.
- [ ] SPA navigácia trackovaná (nie len initial load).

## 877. 877. User identification
- [ ] Po logine → analytics má user_id (hashed).
- [ ] Žiadny PII (email, meno) v event payloade.

## 878. 878. Conversion events
- [ ] Signup → 'user_signed_up' event.
- [ ] First post → 'first_post_created'.
- [ ] First purchase → 'first_purchase' s amount.

## 879. 879. Funnel: signup → activation
- [ ] Admin → Analytics → funnel: visit → signup → first_action.
- [ ] Drop-off rate per step viditeľný.

## 880. 880. Cohort retention
- [ ] Týždenný cohort: D1, D7, D30 retention.
- [ ] mem/features/cohort-retention.md pravidlá enforced.

## 881. 881. Revenue tracking
- [ ] Každý Stripe payment → revenue event v EUR.
- [ ] MRR/ARR dashboard aktuálny.

## 882. 882. Credit ledger audit
- [ ] Admin → Credits → každá transakcia zapísaná.
- [ ] Sum(credits_in) - Sum(credits_out) = current_balance.

## 883. 883. Error tracking (Sentry/logger)
- [ ] Throw test error → zachytené v logger.
- [ ] Stack trace + user context + route.

## 884. 884. Console errors clean
- [ ] DevTools Console na 10 routes → 0 errors, max 2 warnings.

## 885. 885. Network errors monitoring
- [ ] Offline → fetch fail → handleEdgeError() zachytí.
- [ ] User vidí friendly toast, nie raw error.

## 886. 886. Edge function logs
- [ ] Supabase → Edge Functions → Logs dostupné.
- [ ] Errory s stack trace + invocation_id.

## 887. 887. Slow query monitoring
- [ ] Supabase → Database → Slow queries.
- [ ] Žiadny query > 1s opakovane.

## 888. 888. Realtime connections monitoring
- [ ] Admin → Vitals → počet active realtime connections.
- [ ] Pod limitom Supabase planu.

## 889. 889. Stripe webhook reliability
- [ ] Stripe Dashboard → Webhooks → success rate ≥ 99%.
- [ ] Failed webhooks majú retry.

## 890. 890. Daily reconciliation
- [ ] Cron job: Stripe payments ↔ DB transactions match.
- [ ] Discrepancy → admin alert.

## 891. 891. Uptime monitoring
- [ ] External monitor (UptimeRobot/Pingdom) na production URL.
- [ ] Alert pri downtime > 1min.

## 892. 892. Feature flag analytics
- [ ] Každý flag má usage metric.
- [ ] Žiadny dead flag > 90 dní bez cleanup.

## 893. 893. AI credits usage report
- [ ] AI_CREDITS_REPORT.md aktuálny.
- [ ] Per-tool consumption breakdown.

## 894. 894. GDPR audit log
- [ ] Každý export/erasure request zalogovaný.
- [ ] Admin view: kto, kedy, čo.

## 895. 895. Final E2E v47 — Observability audit
- [ ] Všetky kľúčové events trackované (signup, purchase, post).
- [ ] Error rate < 0.5% za posledných 7 dní.
- [ ] Uptime ≥ 99.9% / 30 dní.
- [ ] Reconciliation report = 0 discrepancies.
- [ ] Žiadny critical alert open > 24h.

## 897. 897. Meta description
- [ ] Každá route má meta description pod 160 znakov.
- [ ] Žiadna default 'Lovable Generated Project'.

## 898. 898. Canonical URL
- [ ] <link rel="canonical"> na každej route.
- [ ] Smeruje na https://www.uniqueapp.fun + path.

## 899. 899. Open Graph tags
- [ ] og:title, og:description, og:image, og:url, og:type na každej route.
- [ ] og:image 1200x630px, < 5MB.

## 900. 900. Twitter Card
- [ ] twitter:card=summary_large_image.
- [ ] twitter:title, twitter:description, twitter:image.

## 901. 901. JSON-LD structured data
- [ ] Homepage: Organization schema.
- [ ] Job postings: JobPosting schema (e2e/seo-jobs.spec.ts).
- [ ] Articles: Article schema.
- [ ] Validuj cez schema.org validator.

## 902. 902. Sitemap.xml
- [ ] public/sitemap-index.xml dostupný.
- [ ] scripts/generate-sitemap.mjs produkuje aktuálne entries.
- [ ] Žiadna 404 route v sitemap.

## 903. 903. Jobs sitemap
- [ ] public/sitemap-jobs.xml generovaný cez generate-jobs-sitemap.mjs.
- [ ] Iba published jobs.

## 904. 904. Robots.txt
- [ ] public/robots.txt obsahuje Sitemap: directive.
- [ ] Admin routes Disallow.

## 905. 905. Hreflang tags
- [ ] 12 jazykov má hreflang alternates.
- [ ] x-default = en.

## 906. 906. H1 hierarchy
- [ ] Presne 1× H1 na route.
- [ ] Obsahuje primárny keyword.

## 907. 907. Alt text na obrázkoch
- [ ] Všetky <img> majú popisný alt (nie 'image.jpg').
- [ ] Dekoratívne: alt="".

## 908. 908. Internal linking
- [ ] Hero CTA → kľúčové hub stránky.
- [ ] Footer: linky na všetky main routes.
- [ ] Žiadny orphan page.

## 909. 909. Page speed (SEO)
- [ ] Lighthouse SEO ≥ 95.
- [ ] Mobile-friendly test prejde.
- [ ] Neexistujúca route → /not-found stránka + HTTP 404.
- [ ] Návrat link na homepage.

## 911. 911. Redirect chains
- [ ] Žiadny redirect chain > 1 hop.
- [ ] HTTP → HTTPS jediný 301.

## 912. 912. Cloudflare worker (jobs)
- [ ] cloudflare/job-redirect-worker.js aktívny.
- [ ] /jobs/:slug redirect funguje.

## 913. 913. Social share preview
- [ ] Test cez https://www.opengraph.xyz na 5 routes.
- [ ] Obrázok + title + description sa renderujú.

## 914. 914. Email marketing assets
- [ ] Auth emaily majú správny branding.
- [ ] Transactional emaily testované.

## 915. 915. Final E2E v48 — SEO audit
- [ ] scripts/validate-seo.mjs prejde bez chýb.
- [ ] Lighthouse SEO ≥ 95 na 5 hlavných routes.
- [ ] Sitemap submitted v Google Search Console.
- [ ] schema.org validator: 0 errors.
- [ ] SEO findings dashboard: 0 failing.

## 916. 916. Viewport meta tag
- [ ] index.html má <meta name="viewport" content="width=device-width, initial-scale=1">.
- [ ] Žiadny user-scalable=no.
- [ ] DevTools → 360x640 → žiadny horizontal scroll.
- [ ] Všetok obsah čitateľný bez zoom.

## 918. 918. Safe area insets
- [ ] iPhone notch → env(safe-area-inset-top/bottom) rešpektovaný.
- [ ] Bottom nav nad home indicator.

## 919. 919. Touch targets ≥ 44×44
- [ ] Wall like/comment/share buttony ≥ 44px.
- [ ] Žiadne 'tap-fail' na malých prvkoch.

## 920. 920. Bottom navigation
- [ ] Mobile: bottom nav fixed, 5 hlavných ikon.
- [ ] Active state vizuálne odlišný.

## 921. 921. Swipe gestures
- [ ] Stories: swipe left/right medzi storkami.
- [ ] DM: swipe right na konverzácii → archive.

## 922. 922. Pull-to-refresh
- [ ] Wall feed: pull-down → reload (alebo natívne browser refresh).

## 923. 923. Mobile keyboard handling
- [ ] Input fokus → keyboard sa zobrazí, viewport sa neposunie.
- [ ] Submit button viditeľný nad keyboard.

## 924. 924. Touch scroll performance
- [ ] Wall feed: smooth scroll 60fps na mid-range Android.
- [ ] Žiadny jank pri loading viac postov.

## 925. 925. Image lazy loading mobile
- [ ] Below-the-fold obrázky loading="lazy".
- [ ] Data šetrenie na 3G aktívne.

## 926. 926. Video autoplay mobile
- [ ] Hero video muted+playsinline, autoplay funguje.
- [ ] Nespúšťa sa na Save Data režime.

## 927. 927. PWA manifest
- [ ] public/manifest.webmanifest validný.
- [ ] name, short_name, theme_color, background_color.
- [ ] display: standalone, icons 192/512px maskable.

## 928. 928. Apple touch icon
- [ ] <link rel="apple-touch-icon"> v index.html.
- [ ] 180x180 PNG.

## 929. 929. Install prompt
- [ ] Chrome Android → menu → 'Install app' funguje.
- [ ] iOS Safari → Share → 'Add to Home Screen' funguje.
- [ ] PWAInstall analytics tracked (pwaInstallAnalytics.ts).

## 930. 930. Standalone mode
- [ ] Po inštalácii: app sa otvorí bez browser chrome.
- [ ] Status bar má theme-color.

## 931. 931. Service worker registration
- [ ] Production iba: SW registered z guarded wrapperu.
- [ ] Preview/iframe/dev: SW NEregistered.
- [ ] ?sw=off → unregister funguje.

## 932. 932. Offline fallback
- [ ] Airplane mode → /offline.html sa zobrazí pre nové routes.
- [ ] Cached routes sa otvoria z cache.

## 933. 933. Update flow
- [ ] Nový deploy → user dostane update do 24h.
- [ ] Žiadny stuck old version.

## 934. 934. Push notifications (ak aktívne)
- [ ] Permission prompt po user action (nie auto).
- [ ] Notification klik → správna route.
- [ ] Messaging SW oddelený od app SW.

## 935. 935. Final E2E v49 — Mobile audit
- [ ] iPhone 13 + Pixel 6 reálne zariadenia: signup → post → DM → checkout.
- [ ] Lighthouse Mobile Performance ≥ 90.
- [ ] PWA installable na oboch platformách.
- [ ] Offline fallback funguje.
- [ ] Žiadny horizontal scroll na 360px.

## 936. 936. Production environment variables
- [ ] Všetky secrets v Supabase Vault (nie .env commitnuté).
- [ ] Stripe LIVE keys nasadené, NIE test.
- [ ] STRIPE_WEBHOOK_SECRET pre live endpoint.
- [ ] Lovable AI Gateway key aktívny.

## 937. 937. Custom domain DNS
- [ ] uniqueapp.fun + www.uniqueapp.fun smerujú na Lovable.
- [ ] HTTPS certifikát platný, A+ na SSL Labs.
- [ ] HSTS header aktívny.

## 938. 938. Database backup
- [ ] Supabase daily backups enabled.
- [ ] Point-in-time recovery dostupný.
- [ ] Test restore na staging prejde.

## 939. 939. Migration history clean
- [ ] Žiadna pending migration.
- [ ] supabase migration list = production state.

## 940. 940. Edge functions deployed
- [ ] Všetky funkcie v MISSING_EDGE_FUNCTIONS.md nasadené alebo dokumentované.
- [ ] Verify cez supabase functions list.

## 941. 941. RLS final lockdown
- [ ] supabase linter → 0 ERROR.
- [ ] Žiadna public tabuľka bez RLS.
- [ ] service_role kľúč nikdy v client kóde.

## 942. 942. Stripe production setup
- [ ] Stripe Connect aktívny pre creator payouts.
- [ ] Tax settings konfigurované (EU VAT).
- [ ] Webhook endpoint = production URL.
- [ ] Refund policy v Stripe dashboarde.

## 943. 943. Email delivery production
- [ ] Custom domain email konfigurovaný.
- [ ] SPF/DKIM/DMARC records platné.
- [ ] Test signup email doručený do Inbox (nie Spam).

## 944. 944. Legal pages
- [ ] Terms of Service publikované.
- [ ] Privacy Policy + GDPR rights.
- [ ] Cookie Policy.
- [ ] Imprint / kontakt.
- [ ] 16+ age rating disclosure.

## 945. 945. Content moderation pipeline
- [ ] AI moderácia aktívna pre user content.
- [ ] Report button na každom poste/profile/DM.
- [ ] Admin moderation queue dostupný.

## 946. 946. Customer support channel
- [ ] Support email aktívny.
- [ ] Priority Support SLA systém funguje.
- [ ] Help center / FAQ dostupné.

## 947. 947. Marketing site assets
- [ ] Hero videá optimalizované.
- [ ] OG images na všetkých routes.
- [ ] Lobster Two wordmark 'Unique' všade konzistentný.

## 948. 948. Onboarding flow
- [ ] Nový user: signup → email verify → profile setup → first action.
- [ ] Žiadny dead end, každý krok skippable kde to dáva zmysel.

## 949. 949. Payment flow E2E
- [ ] Test: signup → kúpa credits → použitie AI tool → withdrawal.
- [ ] Stripe live test s real card €1.
- [ ] Refund flow overený.

## 950. 950. Multi-language smoke
- [ ] Prepni do 3 jazykov (SK, EN, DE) → 0 missing keys.
- [ ] Currency stále EUR, formát čísel správny.

## 951. 951. Load test
- [ ] Simulácia 100 concurrent users na homepage → bez chýb.
- [ ] Realtime: 50 concurrent DM users → delivery < 1s.

## 952. 952. Rollback plan
- [ ] Predošlý deploy revertable v Lovable.
- [ ] DB migration down scripts pripravené pre kritické zmeny.

## 953. 953. Monitoring alerts
- [ ] Uptime monitor → SMS/email alert.
- [ ] Error rate > 1% → alert.
- [ ] Failed Stripe webhooks → alert.

## 954. 954. Documentation handoff
- [ ] README.md aktuálny.
- [ ] DIAGNOSTIC_REPORT.md prečítaný.
- [ ] Nathalie QA docs (NATHALIE_QA_*.md) skompletizované.
- [ ] AI_CREDITS_REPORT.md aktuálny.

## 955. 955. GO/NO-GO Launch Decision
- [ ] Všetkých 49 predchádzajúcich checklistov (v1–v49) prejdené.
- [ ] 0 critical bugs open.
- [ ] 0 P1 security findings.
- [ ] Stripe live mode otestovaný real card.
- [ ] Backup + rollback overené.
- [ ] Support team pripravený.
- [ ] → GO LIVE: publish na uniqueapp.fun a oznámiť launch.

