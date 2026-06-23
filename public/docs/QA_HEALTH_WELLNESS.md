# QA Plán — Health & Wellness (8 modulov)

URL po deployi: https://www.uniqueapp.fun/docs/QA_HEALTH_WELLNESS.md

Moduly: Wellness & Relaxation, Psychologist, First Aid, Fit & Slim, Nutrition Hub, Phobia Trading Network, Safety & Bullying Prevention, Lie Detector Chat.

---

## 0. PRÍPRAVA

### Účty
- **U1** — primárny (18+, plné kredity, karta `4242 4242 4242 4242`)
- **U2** — sekundárny (18+, 10 kreditov, karta `4000 0025 0000 3155` — 3DS)
- **U3** — bez kreditov (karta `4000 0000 0000 9995` — declined)
- **U4** — teen (16–17 r., na overenie age gate)
- **U5** — admin/moderator (na moderáciu)

### Prostredie
- Chrome (U1), Firefox (U2), Edge incognito (U3), mobil 360×640 (U4)
- DevTools: Console + Network + Application otvorené stále
- Pred testom: vyčisti storage, prihlás sa, over **€ EUR** vpravo hore
- i18n: prepínať EN ↔ SK ↔ DE ↔ FR ↔ ES
- HTTP kódy: 401, 402, 403, 429, 500

### Globálne pred štartom
1. Mena EUR (žiadne USD/CZK/HUF)
2. Bell notifikácie OK
3. Search OK
4. RLS audit pripravený (curl)

---

## 1. WELLNESS & RELAXATION — `/wellness`

### 1.1 Discovery
1. U1 otvor `/wellness`
2. Hero video hrá, žiadne console chyby
3. Zoznam relaxačných aktivít/kurzov/meditácií
4. Filter: kategória (meditation, breathing, sound bath, yoga), trvanie, cena (EUR)

### 1.2 Voľný obsah
1. Klikni free meditation → audio/video prehrá
2. Pauza, resume, scrubber, loop
3. Bookmark/Save → v `/profile/saved`
4. Zatvor a vráť sa → progress zachovaný

### 1.3 Platený obsah
1. U1 klikni premium session (€2.99) → Stripe checkout v €
2. `4242…` → success → obsah unlocked
3. U2 `4000 0025…` → 3DS → success
4. U3 declined → error, obsah locked

### 1.4 Session timer & guided
1. Spusti 10-min guided meditation
2. Background music slider, voice volume slider
3. Pause + 5 min → resume → správny stav
4. Dokončenie → reward (XP/kredity?), confetti, share modal

### 1.5 AI features
1. **AI personalized plan** → vyplň ciele, stres level → AI odpovedá plánom
2. Kredity ↓ (sleduj counter)
3. U3 → 402 modal
4. Export plánu PDF

### 1.6 Multi-user (group sound bath / live session)
1. U1 vytvorí live session (ak možno) → zdieľa link
2. U2 sa pripojí → realtime audio sync
3. Chat počas session → správy realtime
4. U3 bez prístupu → 401 alebo paywall

### 1.7 Reviews & rating
1. Po session → daj rating 5★ + komentár
2. U2 vidí review na karte
3. Report nevhodnú review → admin queue

### 1.8 RLS
1. Network: `wellness_sessions`, `wellness_progress` — incognito → 401/403
2. Cudzí progress nie je viditeľný

---

## 2. PSYCHOLOGIST — `/psychology`, `/online-psychologist`

### 2.1 Discovery (`/psychology`)
1. Zoznam psychológov/terapeutov
2. Filter: špecializácia, jazyk, cena, hodnotenie, dostupnosť
3. Profil terapeuta: bio, certifikáty, ceny v EUR, kalendár

### 2.2 Rezervácia konzultácie
1. U1 klikni **Book session** → kalendár, vyber slot
2. Stripe checkout → karta `4242…` → success
3. Notifikácia U1 aj terapeut
4. V `/profile/appointments` → záznam
5. U3 declined → no booking
6. U2 3DS → success

### 2.3 Online session (`/online-psychologist`)
1. 5 min pred časom → tlačidlo **Join**
2. Video + audio + chat
3. Mute, camera off, screen share, end call
4. End → automaticky 24h refund window
5. Refund klik → kredity/€ vrátené, audit log

### 2.4 AI Psycholog chat
1. **AI Chat** (samostatne, bez ľudského terapeuta)
2. Pošli správu o úzkosti → AI odpovedá empaticky, neradí medikamenty
3. Crisis keywords ("samovražda", "suicide") → **núdzový banner** s liniami (116 123 SK, 112)
4. Kredity ↓
5. U3 → 402

### 2.5 Privacy
1. Network: konverzácia šifrovaná / nie viditeľná tretím
2. RLS test: incognito GET → 403
3. GDPR delete → konverzácia zmazaná na request

### 2.6 Age gate
1. U4 (17 r.) → smerovaný na Teen Mental Wellness (`/teen-mental-wellness`)
2. U1 (18+) → plný prístup

### 2.7 Multi-user
1. U1 a U2 sú u rôznych terapeutov v rovnakom čase → každý vidí len svoju session
2. Skús join cudzej session cez link → 403

---

## 3. FIRST AID — `/first-aid`

### 3.1 Discovery
1. Zoznam scenárov (CPR, krvácanie, popáleniny, dusenie, infarkt, mŕtvica…)
2. Search "CPR" → relevantné
3. Filter: dospelí/deti/dojčatá

### 3.2 Scenár krok-za-krokom
1. Klikni "Dospelý — bezvedomie"
2. Step 1: prečítaj → ďalší krok
3. Vizuálna ilustrácia / video
4. Timer (napr. 30 stlačení) — počuj beep
5. Voice guidance (ak je) — over TTS
6. Dokončenie → zhrnutie + odporúčania

### 3.3 Núdzové volanie
1. **Call 112** tlačidlo → `tel:112` (mobil otvorí dialer)
2. **Location share** → permission → GPS súradnice
3. Offline mód: zapni airplane → over že obsah dostupný (PWA cache)

### 3.4 AI asistent
1. **AI First Aid Chat** → "Niekto má kŕče"
2. AI odpovedá pokyny krok-za-krokom
3. Vždy odporučí volanie 112 na konci
4. Kredity ↓
5. U3 → 402

### 3.5 Kvíz / certifikát
1. Quiz mode → 10 otázok
2. Skóre → certifikát PDF download
3. Share certifikát na social

### 3.6 Multi-user
1. Group training mode (ak je) → 2+ usre v lekcii
2. Lektor (U1) ovláda postup, U2/U3 sledujú
3. Q&A chat realtime

### 3.7 i18n
- Inštrukcie preložené správne vo všetkých jazykoch (medicínska presnosť!)

---

## 4. FIT & SLIM — `/fit-slim`, `/fitness-wellness`

### 4.1 Onboarding
1. U1 otvorí `/fit-slim`
2. Wizard: vek, váha, výška, cieľ (chudnutie/svaly/forma), úroveň
3. Submit → personalizovaný plán

### 4.2 Workout plány
1. Zoznam tréningov, filter (čas, telesná partia, equipment)
2. Spusti video tréning
3. Timer cvikov, rest periods, počítadlo sérií
4. Označiť ako hotové → progress ↑

### 4.3 Tracking
1. Zadaj váhu dnes → graf trendu
2. Body measurements (pás, hrudník, …)
3. Pred/po fotky (upload, blur option)
4. Export CSV/PDF report

### 4.4 AI Coach
1. **AI Trainer** → "Cvik na zadok bez vybavenia"
2. AI vygeneruje 5 cvikov s GIF/video
3. Kredity ↓
4. **AI Plan generator** — týždenný plán, kredity ↓
5. U3 → 402

### 4.5 Platený plán
1. Premium plan €19.99/mes → Stripe
2. `4242…` → success → unlock advanced workouts
3. Cancel sub → end-of-period prístup
4. U2 3DS, U3 declined

### 4.6 Social
1. Zdieľaj workout completion na wall
2. Friend challenge: pozvi U2 na 30-day plan
3. U2 prijme → leaderboard u oboch
4. Daily push notifikácia (ak povolené)

### 4.7 Multi-user
1. U1 a U2 v rovnakom challenge → leaderboard realtime
2. U1 ukončí workout → U2 dostane notifikáciu "U1 dokončil deň 5"
3. RLS: U3 nevidí ich progress

### 4.8 Age gate
- Tréningy 16+ (silové, intenzívne) — U4 vidí len mierne kategórie

---

## 5. NUTRITION HUB — `/nutrition-hub`, `/master-chef-nutrition`, `/nutrition-subscriptions`

### 5.1 Discovery
1. Zoznam recept, plánov, kalkulačiek
2. Filter: vegan/keto/paleo, alergény, kalórie

### 5.2 Recept
1. Klikni recept → ingrediencie, postup, makrá, foto
2. Save/bookmark
3. Add to shopping list
4. Print/PDF export

### 5.3 Plánovač jedál
1. Vytvor 7-day meal plan
2. Drag&drop recept do dňa
3. Auto-generuj shopping list
4. Export

### 5.4 AI Nutrition (`/master-chef-nutrition`)
1. Nahraj foto jedla → AI rozpozná + makrá
2. Voice describe → "Mal som vajce a banán"
3. Kredity ↓
4. **AI Meal plan** — vyplň ciele → AI plan
5. U3 → 402

### 5.5 Predplatné (`/nutrition-subscriptions`)
1. Tier €9.99 (basic) / €19.99 (pro) / €29.99 (coach)
2. Stripe checkout v EUR
3. Karta `4242…` → unlock prémiové plány
4. U2 3DS, U3 declined
5. Cancel → end-of-period

### 5.6 Calorie/macro tracking
1. Denný log: pridaj jedlo (search alebo barcode)
2. Graf makier deň/týždeň/mesiac
3. Goals progress

### 5.7 Multi-user
1. Family plan: U1 zdieľa plan s U2
2. Coach mode: U1 (coach) vidí progress U2 (klient) — s explicit consent
3. RLS: bez consentu U1 nevidí U2 data → 403

### 5.8 Bezpečnosť
1. Zdravotné disclaimery viditeľné
2. AI nepredpisuje diéty pri tehotenstve/chorobách → odporúča lekára

---

## 6. PHOBIA TRADING NETWORK — `/phobia-trading`

### 6.1 Onboarding
1. U1 otvor `/phobia-trading`
2. Hero video
3. Vyplň profil: svoje fóbie (zoznam), čo chceš "vymeniť"

### 6.2 Discovery
1. Feed iných užívateľov s fóbiami
2. Filter: kategória (zvieratá, výšky, sociálne, špecifické)
3. Match algoritmus: komplementárne páry

### 6.3 Exchange (trade)
1. U1 navrhne výmenu U2 (ja ti pomôžem s pavúkmi, ty mne s lietaním)
2. U2 dostane request → accept/decline
3. Accept → otvorí sa private space (chat + plán postupu)

### 6.4 Therapy steps
1. Štruktúrované cvičenia (exposure therapy guided)
2. Progress tracking obojstranný
3. Milestones, celebrations

### 6.5 AI asistent
1. AI navrhne plán expozície
2. Kredity ↓
3. Crisis detection → odporúči profesionála (link na `/psychology`)

### 6.6 Bezpečnosť
1. Disclaimer: "Toto nenahrádza profesionálnu terapiu"
2. PII masking v chate
3. Report user → moderation queue
4. Block → no contact
5. Age gate 18+ (alebo s rodičovským súhlasom 16+)

### 6.7 Multi-user
1. U1 a U2 aktívne trade → realtime chat, progress sync
2. U3 sa pokúsi vidieť ich space → 403
3. Group support sessions (3+ users) → over moderation

### 6.8 RLS
1. `phobia_profiles`, `phobia_trades`, `phobia_messages` — incognito 401/403
2. Citlivé dáta nikdy nie sú vo veriejnom feede

---

## 7. SAFETY & BULLYING PREVENTION — `/safety-prevention`

### 7.1 Discovery
1. Zoznam zdrojov: články, videá, scenáre
2. Filter: vek (deti/teens/dospelí), typ (cyber/škola/práca)

### 7.2 Educational content
1. Klikni článok → čítaj
2. Interactive scenarios → "Čo by si urobil?"
3. Quiz → skóre + feedback

### 7.3 Report nástroj
1. **Report incident** → form: typ, popis, dôkazy (screenshot upload)
2. Anonymous toggle
3. Submit → confirmation, ticket ID
4. Status tracking v `/profile/reports`

### 7.4 AI Chat support
1. **Talk to AI** → "Šikanujú ma v škole"
2. AI empatická odpoveď, action steps
3. Crisis → núdzové linky (116 111 detská linka SK)
4. Eskalácia na ľudského moderátora
5. Kredity ↓ alebo zdarma (citlivá oblasť — over)

### 7.5 Anonymous community
1. Zdieľaj príbeh anonymne
2. Komentáre s moderáciou (premoderation)
3. Like/support reactions
4. Report toxic comment → instant hide pending review

### 7.6 Moderácia (U5 admin)
1. Queue reportov
2. Action: warn, mute, ban, escalate to authorities
3. Audit log všetkých akcií

### 7.7 Multi-user
1. Group support circle (3–6 ľudí)
2. Moderátor (U5) prítomný
3. Realtime chat, šifrovaný
4. Leave anytime, mute, block

### 7.8 Špeciálne pre teens (U4)
1. Parental notification toggle (gold pass / kids guard)
2. Math gate pred citlivými témami
3. Auto-redirect na pomoc ak detekcia self-harm

### 7.9 RLS & bezpečnosť
1. Anonymné reporty: žiadny user_id viditeľný v public feede
2. PII strip pred publish
3. Incognito GET → 401

---

## 8. LIE DETECTOR CHAT — `/lie-detector`

### 8.1 Onboarding
1. U1 otvor `/lie-detector`
2. Hero, vysvetlenie ("AI analyzuje text/voice na pravdepodobnosť lži")
3. Disclaimer: "Pre zábavu, nie forenzný nástroj"

### 8.2 Sólo režim (text)
1. Napíš tvrdenie ("Včera som bežal 10 km")
2. AI vráti score (0–100% pravdivosti) + reasoning
3. Kredity ↓ (3–5)
4. História analýz
5. U3 → 402

### 8.3 Voice režim
1. Record voice statement
2. AI analyzuje tón, pauzy, slovník
3. Score + breakdown
4. Replay nahrávky

### 8.4 Multi-user duel
1. U1 challenge U2 → "Lie detector duel"
2. U2 accept → realtime game
3. Striedanie otázok, druhý háda truth/lie
4. AI score na konci, winner
5. Leaderboard (priateľov)

### 8.5 Group party mode
1. U1 vytvorí lobby (3–8 hráčov: U2, U3, U4)
2. QR code / link na join
3. Turn-based, AI moderátor
4. Live realtime updates u všetkých
5. Final ranking

### 8.6 Share results
1. Zdieľaj výsledok na wall
2. Privacy: výsledok len pre teba / priateľov / public

### 8.7 RLS
1. Vlastná história — incognito 403
2. Group session — len participanti
3. Network: `lie_detector_sessions` má `participants` filter

### 8.8 Bezpečnosť
1. Voice nahrávky šifrované, auto-delete po 30 dňoch
2. GDPR export/delete
3. Age gate 16+ (otázky môžu byť osobné)

---

## 9. CROSS-MODULE (povinné)

### 9.1 Kredity consistency
Po akcii v každom module over kredity v: hornom baneri, `/profile/wallet`, `/credits`, DB response. Musia byť rovnaké.

### 9.2 EUR-only
Network search: 0× `"USD"`, `"CZK"`, `"HUF"`. UI všade `€`.

### 9.3 i18n
EN/SK/DE/FR/ES — žiadne `__MISSING__`, žiadne raw kľúče (`wellness.cta.start`).
Medicínske texty (First Aid, Psychology) — overiť presnosť prekladu.

### 9.4 RLS audit (curl)
```
curl -i "https://<project>.supabase.co/rest/v1/<table>?select=*" -H "apikey: <ANON>"
```
Tabuľky: `wellness_sessions`, `psychology_appointments`, `psychology_messages`, `first_aid_progress`, `fitness_workouts`, `fitness_progress`, `nutrition_meals`, `nutrition_plans`, `phobia_profiles`, `phobia_trades`, `safety_reports`, `lie_detector_sessions`.

Očakávaj `[]` alebo 401, nikdy cudzie dáta.

### 9.5 Race conditions
1. 2 taby → start premium session → 1 platba
2. 2 taby → book appointment same slot → 1 booking, druhý "Slot taken"
3. 2 taby → submit log meal → 1 záznam

### 9.6 Age gate
- 18+ blokácia: Psychology (adult), Phobia Trading (alebo s consentom), Lie Detector duel s adult témami
- Teen redirect: U4 z `/psychology` → `/teen-mental-wellness`
- First Aid, Nutrition, Wellness — povolené pre teens

### 9.7 Crisis & núdzové scenáre
- Psychology AI, Safety AI, Lie Detector — pri keywords (suicide, self-harm) → núdzový banner s 116 123 / 112
- Test: zámerne napíš crisis frázu → over UI banner + log incidentu

### 9.8 Notifikácie
- Booking confirmation, session reminder (1h pred), refund processed, group invite
- Bell counter, push, email digest

### 9.9 GDPR
- Export dát (každý modul)
- Delete account → všetky citlivé dáta zmazané (psychology messages, phobia data, voice nahrávky)

### 9.10 Realtime sharding
- Group sessions (sound bath, support circle, lie duel) — over WS stability pri 6+ paralelných participantoch

---

## 10. PERFORMANCE

1. Lighthouse mobil každá stránka: Perf ≥ 70, A11y ≥ 90, SEO ≥ 90
2. TTI < 5s, LCP < 2.5s, CLS < 0.1
3. Memory: 30-min wellness session → < 50MB nárast
4. Slow 3G → skeleton loadery, žiadne white screens
5. Offline (First Aid PWA) → kritické scenáre dostupné

---

## 11. REPORTING TEMPLATE

```
Modul: [napr. Psychology]
Sekcia: [2.3 Online session]
Krok: [4]
URL: [/online-psychologist]
Účet: [U1]
Reprodukcia: 1. ... 2. ... 3. ...
Očakávané: [...]
Skutočné: [...]
Console: [chyba]
Network: [status, endpoint]
Screenshot: [link]
Priorita: P0 / P1 / P2
```

---

## 12. PORADIE TESTOV

**P0 (kritické, citlivé):**
1. Psychology (vrátane crisis detection)
2. First Aid (medicínska presnosť, 112 call)
3. Safety & Bullying (anonymita, reporty, moderácia)
4. Phobia Trading (RLS, disclaimer)
5. RLS audit všetkých tabuliek

**P1 (vysoké, platby):**
6. Nutrition Hub + subscriptions (Stripe)
7. Fit & Slim (premium)
8. Wellness premium content
9. Kredity audit cross-module

**P2 (stredné):**
10. Lie Detector (single + duel)
11. Group sessions (sound bath, support circle, party lie duel)
12. AI funkcie všetkých modulov (kredity, 402)

**Final:**
13. EUR audit + i18n
14. Race conditions
15. Age gate (U4)
16. GDPR export/delete
17. Performance + offline (First Aid PWA)
