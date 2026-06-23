# QA – Kategória: Mystical & Spiritual

Kompletný manuálny test-plán pre 13 modulov kategórie Mystical & Spiritual.
URL base: `https://www.uniqueapp.fun`

---

## 0. PRÍPRAVA (raz pred testovaním)

### Účty
- **U1 (Tester A)** – plný kredit (100+ AI kreditov), Premium aktívny.
- **U2 (Tester B)** – stredný kredit (~30), bez Premium.
- **U3 (Tester C)** – nulový kredit / 5 kreditov (test edge cases a paywall).
- **U_ADMIN** – admin účet pre kontrolu logov / payouts.

Pre multi-user testy otvor **3 prehliadače** (Chrome U1, Firefox U2, Safari/Edge U3) alebo Chrome profily. NIKDY nepoužívaj rovnaký účet v dvoch oknách.

### Stripe testovacie karty
- `4242 4242 4242 4242` – OK platba
- `4000 0000 0000 0002` – decline
- `4000 0025 0000 3155` – 3DS challenge

### DevTools setup (každý prehliadač)
1. F12 → **Console** tab → "Preserve log" ON, filter "Errors".
2. **Network** tab → "Preserve log" ON, filter `supabase|functions|stripe`.
3. **Application** → Local Storage → over `unique-theme-v2`, `i18nextLng`.
4. Throttling: testuj raz `Fast 3G` (latencia).

### Viewporty
- Mobile 360×640 (real telefón ak možno)
- Tablet 768×1024
- Desktop 1440×900

### Globálne kontroly v každom module
- [ ] Mena: výlučne **EUR (€)**, žiadne USD/CZK/HUF.
- [ ] Jazyk: prepni EN → SK → DE, content sa preloží, nelomí layout.
- [ ] Tmavý/svetlý mód toggle funguje, nie je FOUC.
- [ ] Age gate 16+ kde sa zobrazí (pre tieto moduly väčšinou áno – oracle/dating).
- [ ] Lighthouse Performance > 70, CLS < 0.1.
- [ ] A11y: TAB navigácia, alt texty, role/aria.

---

## 1. PAST LIFE EXPLORER `/past-life`

### 1.1 Vstup (U1)
1. Otvor `/past-life` (zaloguj sa).
2. Over: hero, ukážky výsledkov ("Ideas showcase"), CTA tlačidlo.
3. Klikni "Začať" → otvorí sa formulár.

### 1.2 Generovanie (U1, plný kredit)
1. Vyplň formulár: meno, dátum narodenia, miesto, otázka.
2. Klikni "Odhaľ minulý život". Sleduj loader.
3. Over po dokončení:
   - [ ] Výsledok: era, lokácia, povolanie, lekcia, vizuál (obrázok).
   - [ ] Kredity sa odpočítali (zobraz `/billing` v druhom tabe pred/po).
   - [ ] Tlačidlá: **Share / Download / Re-generate / Save to profile**.
4. Klikni Share → over kopírovanie linku + OG preview (paste do Slacku/WhatsApp).
5. Otvor zdieľaný link v inkognito → public view bez paywallu.

### 1.3 Edge cases
1. **U3 (0 kreditov)**: skús generovať → musí prísť `402` modal s nákupom kreditov (NIE biela stránka).
2. Prázdny formulár → validácia.
3. Dátum z budúcnosti → validácia.
4. Špeciálne znaky v mene `<script>alert(1)</script>` → musí byť escaped.

### 1.4 Multi-user
1. U1 zdieľa výsledok → U2 otvorí link → vidí výsledok + "Vyskúšaj svoj".
2. U2 sa pokúsi re-generovať U1 výsledok → musí ísť ako vlastný (nový kredit).

---

## 2. LOTTERY AI `/lottery-ai`

### 2.1 Predikcie (U1)
1. Otvor `/lottery-ai`. Vyber typ lotérie (Euro Jackpot / Powerball / Tipos…).
2. Klikni "Generuj numerologické čísla".
3. Over: 6 čísel + bonus, vysvetlenie (numerologia z dátumu narodenia).
4. **Lottery Numerology** sub-modul: vlož dátum narodenia → over breakdown.

### 2.2 História & rate-limit
1. Generuj 5x za sebou → over že existuje denný / hodinový limit (anti-spam).
2. História predikcií viditeľná, perzistentná po refresh.

### 2.3 Multi-user
1. U1 a U2 generujú pre rovnaký dátum žrebovania → výsledky musia byť **deterministicky odlišné** podľa ich vlastných dát (nie identické).

---

## 3. ASTROLOGY `/astrology`

Najväčší modul – 10+ pod-nástrojov. Testuj postupne.

### 3.1 Hero + Credits display (U1)
- [ ] `AstrologyHero` načítaný, `AstrologyCreditsDisplay` ukazuje aktuálny balance v EUR a kredity.

### 3.2 Daily Horoscope
1. Vyber znamenie → načíta sa denný horoskop.
2. Refresh stránky → ten istý obsah pre dnešok (cache, nie nová generácia = nestojí kredit pri pohľade).
3. Prepni dátum (ak picker existuje) → nový obsah.

### 3.3 Birth Chart Analyzer
1. Zadaj presný dátum + čas + miesto narodenia.
2. Generuj → over natal chart (kruh s planétami), interpretáciu.
3. Download PDF/PNG → over že obsahuje meno + diagram.
4. Edge: čas 00:00, miesto nezadané → validácia.

### 3.4 Compatibility Checker
1. Zadaj 2 osoby (dátumy narodenia).
2. Generuj → over skóre %, popis silných/slabých stránok.
3. Multi-user: U1 vygeneruje s U2 (zadá jeho dátum) → zdieľa link → U2 vidí ten istý report.

### 3.5 Tarot Reader
1. Vyber rozloženie (1-karta / 3-karty / Celtic Cross).
2. "Zamiešať" → ťahaj karty (drag alebo klik).
3. Over: kresba kariet, pozícia, interpretácia, kreditny odpočet len 1× za reading.
4. Skús ťahať 2x naraz rýchlym dvojklikom → musí byť idempotentné (1 reading).

### 3.6 Rune Reader
1. Vyhoď runy (1 / 3 / 9).
2. Over zobrazenie symbolov + významov + obrátených pozícií.

### 3.7 Numerology Calculator
1. Vlož meno + dátum → vypočíta Life Path, Destiny, Soul Urge.
2. Zmena diakritiky (Adam vs Ádám) → výsledok môže líšiť, neporušuje.

### 3.8 Palmistry Reader
1. Upload fotku dlane (JPG, < 5 MB).
2. Over detekciu čiar, interpretáciu.
3. Edge: upload non-image (PDF) → odmietne s hláškou.
4. Upload 20 MB súboru → odmietne (size limit).

### 3.9 Dream Interpretation
1. Popíš sen text (>200 znakov).
2. Generuj → symbolika, emócie, odporúčania.
3. Multilingual: napíš sen po slovensky → interpretácia v SK.

### 3.10 Yes/No Oracle
1. Polož otázku → klik "Spýtaj sa".
2. Over: jasná YES/NO/MAYBE odpoveď + krátky komentár.
3. Spam test: 20× za sebou → rate-limit po N pokusoch.

### 3.11 Daily Mystical Ritual
1. Over že denný rituál je rovnaký pre všetkých používateľov v ten istý deň (alebo personalizovaný – over consistency).

### 3.12 Mystical Profile
1. Zobraz vlastný profil → over agregát: znamenie, Life Path, posledné readingy.
2. Privacy: prepni viditeľnosť na "Private" → U2 nesmie vidieť pri otvorení tvojho linku.

### 3.13 Live Chat with AI
1. Otvor chat → polož otázku (1 token ~= 1 kredit alebo per správa).
2. Pošli 5 správ → over plynulosť, kontext (pamätá si tému).
3. Sieťový test: vypni wifi po odoslaní → musí ukázať error a NEodpočítať kredit.
4. **Multi-user**: U1 a U2 paralelne chatujú → relácie sa nesmú miešať (sessionId scoped per user).

### 3.14 Friendship Horoscope (cross-modul s Best Friend)
- Z `/best-friend` → "Friendship Horoscope" → over že vyžaduje 2 dátumy.

---

## 4. DREAM ANALYZER / `/dream-journal`

### 4.1 Zápis snu (U1)
1. "Nový sen" → vyplň názov, opis, dátum, tagy (lucid / nightmare / recurring).
2. Ulož → objaví sa v zozname.
3. Edit / Delete – over CRUD.

### 4.2 AI interpretácia
1. Pri sne klik "Interpretovať AI" → 3-5 kreditov odčítaných.
2. Over symboly, emócie, archetypy.

### 4.3 Dream Interpretation Battles (multi-user!)
1. U1 vytvorí "battle" – zverejní svoj sen ako súťaž.
2. U2 a U3 podajú vlastné interpretácie (text + voting).
3. U1 vyberie víťaza / komunita hlasuje → over leaderboard, prípadný credit reward.
4. Anti-cheat: U1 nesmie hlasovať za seba; U2 nesmie spamovať 100 hlasov (1 vote per user).

### 4.4 Privacy
- Dreams default = private. Skús otvoriť `/dream-journal/<id>` U2 v cudzom účte → 403/404.

---

## 5. CRYSTAL & ENERGY NETWORK `/crystal-energy-network`

### 5.1 Hero + About
- Over `CrystalHero`, `CrystalAbout`, `CrystalEngagementRow` (čísla aktivity).

### 5.2 Tool cards – preklikať VŠETKY:
Pre každý nástroj: open → použiť → zatvoriť, sledovať konzolu.

1. **Crystal Encyclopedia** – search "Amethyst" → detail, vlastnosti, čakra.
2. **Crystal Oracle** – ťah dňa, jeden kryštál + posolstvo.
3. **Chakra Balancing** – výber chakier, audio/visual session, timer.
4. **Sound Bath** – prehraj zvukovú frekvenciu (432Hz / 528Hz). Over audio loop, stop button, autoplay restrictions.
5. **Moon Phase** – kalendár fáz, dnešný stav, rituál odporúčanie.
6. **Crystal Timer** – meditation timer 5/10/20 min, zvonček na konci.
7. **Sub Box** (predplatné box?) – over Stripe flow ak existuje, mena EUR.

### 5.3 Multi-user
- Sound Bath spustený v 2 účtoch súčasne → každý má vlastnú session, nie shared.
- Encyclopedia comments/ratings (ak sú) → U1 napíše review, U2 vidí.

---

## 6. DNA SOCIAL MEMORY NETWORK `/dna-memory-network`

1. Otvor stránku → over úvod, koncepcia.
2. Vytvor "memory" / DNA záznam – formulár, upload.
3. Linkovanie s príbuznými (rodinný strom?) – multi-user: U2 prijíma link request od U1.
4. Privacy: rodinné údaje musia byť RLS-locked.
5. Edge: skús cez Network tab manuálne `GET /dna_memories?user_id=<U2 uuid>` → musí vrátiť []/401.

---

## 7. REINCARNATION SOCIAL `/reincarnation-social`

### 7.1 Akashic Records
- Vlož otázku → AI odpoveď, kredit odčítaný.

### 7.2 Soul Art Generator
- Vlož popis duše → vygeneruje obrázok. Over EUR cena, download.

### 7.3 Meditation Chamber
- Spusť reláciu (5/15/30 min), audio + vizuál. Pauza, resume.

### 7.4 Life Lesson Journal
- CRUD lekcií, AI sumarizácia.

### 7.5 Karmic Analytics
- Over dashboard s metrikami (počet lekcií, karmický skóre).

### 7.6 Spiritual Community (multi-user!)
1. U1 napíše post → U2 vidí v feeds.
2. U2 reaguje (comment, react).
3. Moderation: U1 nahlási U2 post → admin (U_ADMIN) vidí v moderation queue.
4. Mute/Block – U1 blokne U2, prestane vidieť jeho posty.

---

## 8. BLOCKCHAIN CONFESSIONS `/blockchain-confessions`

### 8.1 Confession Journal (U1)
1. Napíš spoveď (text/voice), urči viditeľnosť (anonymous public / private).
2. "Hash & Submit" – over že sa zobrazí tx-hash / merkle proof UI.

### 8.2 Voice Confessions
1. Stlač record (mikrofón permission).
2. Nahraj 30s → upload → over že sa zobrazí prehrávač + transkripcia.
3. Edge: deny mikrofón → friendly error.

### 8.3 AI Spiritual Advisor
- Po spovedi AI poradí cestu nápravy.

### 8.4 Absolution Ceremony
- Klik "Absolúcia" → ceremónia (animácia, mantra).

### 8.5 Redemption Dashboard
- Over progress bar, sériu dní, badges.

### 8.6 Confession Analytics
- Súhrn: počet spovedí, dominantné témy, sentiment.

### 8.7 Multi-user / public feed
1. U1 publikuje **anonymous** confession.
2. U2 vidí vo feed bez identifikácie U1 (over že NEMÔŽE odhaliť `user_id` cez DevTools / Network).
3. U2 dá "I forgive you" reakciu → U1 dostane notifikáciu (bez odhalenia U2).

---

## 9. MULTIVERSE PROFILE NETWORK `/multiverse-network`

1. Vytvor "alternate self" profile (iná verzia teba).
2. Prepínanie medzi alter-egos.
3. Multi-user: U1 a U2 prepoja svoje multiverse profily → over visibility & permissions.
4. Edge: skús vytvoriť 100 profilov → musí byť limit.

---

## 10. QUANTUM SOCIAL NETWORK `/quantum-social`

### 10.1 AI Quantum Oracle
1. Polož otázku → over kvantovú "superpozíciu" výsledkov (viacero možností s pravdepodobnosťou).
2. Spam/rate-limit test.

### 10.2 Feed / posty (ak existujú)
- Standard social testy: post / like / comment / share.

### 10.3 Multi-user
- U1 "entangle" s U2 (request) → U2 accept → over shared state / synced reactions.

---

## 11. TIME CAPSULE NETWORK `/time-capsule`

### 11.1 Vytvorenie kapsule (U1)
1. Vytvor kapsulu: text/foto/video, **unlock date** v budúcnosti (napr. +1 deň).
2. Vyber recipientov: self / friends / public.
3. Over že pred unlock dátumom obsah JE zašifrovaný/skrytý.

### 11.2 Unlock
1. Nastav unlock date = teraz +2 min, počkaj, refresh → obsah dostupný.
2. Recipient (U2) – pred dátumom vidí len "počkaj do …", po dátume notif + obsah.

### 11.3 Edge
- Unlock date v minulosti pri vytváraní → validácia.
- Skús cez DevTools/network `select capsule_content` pred unlock → server musí vrátiť 403 (nie len UI hide).

---

## 12. TIME REVERSAL SOCIAL `/time-reversal`

1. Over koncept (rewind posty, "čo by bolo keby").
2. Vytvor "rewind" akciu na vlastnom post / event.
3. Multi-user: U1 spraví rewind, U2 vidí pôvodnú aj revertovanú verziu (timeline diff).
4. Audit log – over že akcie sú zaznamenané (nedá sa zmazať bez stopy).

---

## 13. HOLOGRAPHIC AVATARS `/holographic-avatars`

### 13.1 Holographic Gallery
1. Browse existujúce hologramy.
2. Filter / search.

### 13.2 Create avatar (ak je creator UI)
1. Upload foto / popis → generuj 3D/hologram preview.
2. Over kreditny odpočet (EUR cena).
3. Download / share.

### 13.3 Multi-user
- U1 pošle hologram U2 (gift / share) → U2 dostane v inboxe.
- Komentáre / reakcie na hologramy iných.

---

## 14. CROSS-MODULE INTERAKCIE (povinné)

### 14.1 Kredity konzistencia
1. Pred testom: zaznamenaj balance na `/billing`.
2. Vykonaj v každom module 1 generáciu.
3. Po každej: refresh `/billing` v druhom tabe → over že balance klesol presne o cenu modulu.
4. Súčet odpočtov = pôvodný − aktuálny (žiadne "duchovné" straty kreditov).

### 14.2 Currency lock
- Vo všetkých Stripe checkout dialógoch musí byť `currency: eur`. Skontroluj v Network → payload requestu na `create-checkout-session`.

### 14.3 Shared profile data
- Birth date zadaný v Astrology sa môže auto-propagovať do Numerology / Past Life / Lottery (ak je shared profile). Over že zmena na jednom mieste sa prejaví všade alebo je explicitne per-modul.

### 14.4 Notifikácie
- Akcie z modulov 8/11/13 (confession reaction, capsule unlock, hologram gift) → over že prídu v top-bar notifikáciách + emailom (ak povolené).

### 14.5 Search
- Otvor globálne vyhľadávanie (`Ctrl+K`) → zadaj "tarot", "dream", "crystal" → musia sa nájsť moduly + ich pod-stránky.

### 14.6 Race condition (multi-tab same user)
1. U1 otvorí Astrology v 2 taboch.
2. V oboch súčasne klikni "Generate Tarot".
3. Over: oba requesty prejdú alebo 1 sa zabije s lock-hláškou; kredit sa odpočíta presne podľa počtu úspešných generácií, nie viac.

### 14.7 Age gate 16+
- Z incognita / nového účtu narodeného 2015 → moduly Tarot/Dating-related musia zobraziť 16+ gate.

### 14.8 RLS audit
Pre KAŽDÝ modul, ktorý ukladá user data, otvor Network tab a skopíruj request URL na supabase. V terminále:
```
curl 'https://<proj>.supabase.co/rest/v1/<table>?select=*' \
  -H 'apikey: <anon>' -H 'Authorization: Bearer <U2_jwt>'
```
Skús čítať dáta U1 z účtu U2 → MUSÍ vrátiť [] / 401.

---

## 15. PERFORMANCE & STABILITA

Pre každý modul:
- [ ] First load < 3s na Fast 3G.
- [ ] Žiadne console errors (warningy OK ak sú benígne).
- [ ] Žiadne 4xx/5xx v Network (okrem zámerných testov).
- [ ] Memory leak: nechaj modul otvorený 10 min, sleduj Memory tab → graf nesmie monotónne rásť.
- [ ] Reload uprostred AI generácie → loader sa neukáže navždy, request sa abortuje.

---

## 16. ŠABLÓNA HLÁSENIA CHYBY

```
Modul:           [napr. Astrology – Tarot Reader]
URL:             https://www.uniqueapp.fun/astrology
Účet:            U2 (beata.vikorova@yandex.com)
Viewport:        Desktop 1440×900 / Mobile 360×640
Reprodukcia:
  1. ...
  2. ...
  3. ...
Očakávané:       ...
Skutočné:        ...
Console error:   [paste]
Network:         [endpoint, status, payload]
Screenshot:      [link]
Priorita:        P0/P1/P2
```

---

## 17. PORADIE TESTOVANIA (odporúčané)

1. **P0 – peniaze/kredity**: Past Life, Astrology (Live Chat, Tarot), Dream Analyzer, Crystal (Sub Box), Lottery.
2. **P0 – privacy**: Dream Journal, DNA Memory, Blockchain Confessions, Time Capsule.
3. **P1 – multi-user**: Reincarnation Spiritual Community, Dream Battles, Multiverse, Quantum Entangle, Holographic gift.
4. **P1 – kreatívne**: Soul Art, Holographic Avatars, Palmistry.
5. **P2 – polish**: Daily Mystical Ritual, Moon Phase, Encyclopedia, animations, i18n stringy.
6. **Cross-module** (sekcia 14) – až po dokončení per-modul P0/P1.

---

Koniec dokumentu. Po dokončení tieto checklisty zhrňme do reportu pre Megalomanský audit.
