# QA Plán — Social & Dating (9 modulov zo screenshotu)

URL na stiahnutie: https://www.uniqueapp.fun/docs/QA_SOCIAL_DATING_SCREENSHOT.md

Moduly: Anonymous Date, Dating, Best Friend, Membership Community, Messenger, Megaforum, Character Companions, Emotion Economy, Invite Friend.

---

## 0. PRÍPRAVA

### Účty
- **U1** (primárny tester, 18+, plné kredity, Stripe test karta `4242 4242 4242 4242`)
- **U2** (sekundárny 18+, kredity 10, karta `4000 0025 0000 3155` — vyžaduje 3DS)
- **U3** (18+ bez kreditov, karta `4000 0000 0000 9995` — declined)
- **U4** (16–17 rokov — na overenie blokácie 18+ obsahu)

### Prostredie
- 3 prehliadače: Chrome (U1), Firefox (U2), Edge incognito (U3), mobil 360×640 (U4)
- DevTools: Console + Network + Application/Storage otvorené v každom okne
- Pred každým testom: vyčisti storage, prihlás sa, over EUR menu vpravo hore
- Jazyk: prepínať EN ↔ SK ↔ DE — overiť i18n
- Sleduj 402 (no credits), 401 (auth), 403 (RLS), 429 (rate-limit), 500 (server)

### Globálne kontroly (pred štartom)
1. Mena vždy **€ EUR** — žiadne $/CZK/HUF nikde
2. Bell ikona (notifikácie) funkčná
3. Search funguje (top bar)
4. RLS: žiadny endpoint nevracia cudzie dáta neprihlásenému (curl test)

---

## 1. ANONYMOUS DATE — `/anonymous-date`

### 1.1 Vstup a onboarding
1. U1 → otvor `/anonymous-date`
2. Over že stránka načítava bez chyby, hero video hrá
3. Klikni **Vytvoriť anonymný profil** / **Start**
4. Vyplň: prezývka, vek 25, pohlavie, hľadám, mesto, bio (200 znakov)
5. Nahraj 1 foto (rozmazaná / blurred verzia by mala byť defaultne zobrazená v zozname)
6. Klikni **Uložiť** → over redirect na feed/list

### 1.2 Feed kandidátov
1. Posúvaj zoznam — over že fotky sú **rozmazané** (anonymný režim)
2. Mená zobrazené iba ako prezývky
3. Klikni na kartu → detail s blurred foto + bio + "Odhaliť za X kreditov" tlačidlo
4. **U3** (0 kreditov) klikne Odhaliť → očakávaj 402 + modal "Doplň kredity"
5. **U1** klikne Odhaliť → potvrď platbu kreditmi → foto sa odkryje (toast success)
6. Over že druhá strana (U2) dostala notifikáciu "Niekto si ťa pozrel"

### 1.3 Like / Match
1. U1 dá **Like** profilu U2
2. U2 v druhom prehliadači má notifikáciu "Máš anonymný záujem"
3. U2 dá Like späť → **Match!** modal u oboch
4. Otvorí sa anonymný chat (24h timer)
5. Po 24h bez odhalenia → chat sa zamkne (test: zmeň system time alebo skráť timer v DB)

### 1.4 RLS / bezpečnosť
1. V Network tabe nájdi request na `anonymous_dating_profiles`
2. Skopíruj URL, otvor v incognito bez tokenu → očakávaj 401/403
3. Over že `email`, `phone`, `real_name` **nikdy** nie sú vo response

### 1.5 Multi-user (U1+U2+U3)
1. Všetci 3 vytvoria profil súčasne
2. U1 a U2 sa lajknú → Match
3. U3 sa pokúsi vidieť ich chat cez priamy link → 403
4. U1 reportuje U2 ako spam → over že U2 admin queue dostane záznam

---

## 2. DATING — `/dating`

### 2.1 Age gate
1. **U4 (17 r.)** otvorí `/dating` → očakávaj blokáciu "18+ only"
2. U1 (18+) prejde

### 2.2 Onboarding
1. Klikni **Začať** → wizard (5 krokov: foto, bio, preferencie, lokalita, záujmy)
2. Skús preskočiť povinné pole → validačná chyba
3. Dokončí → redirect na swipe

### 2.3 Swipe
1. Swipe vpravo (like) 5x, vľavo (pass) 5x
2. **Super Like** (hviezda) → odpočíta kredity (over počet v profile vpravo)
3. U3 (0 kreditov) klikne Super Like → 402 modal
4. Rewind (späť) → over že vráti posledný swipe (ak má daný balík)

### 2.4 Match
1. U1 likne U2 a naopak → Match modal "It's a match!"
2. Klikni **Send message** → otvorí sa chat
3. Pošli text, emoji, GIF, voice správu
4. U2 v druhom okne realtime vidí typing indikátor + správy
5. Unmatch (menu vpravo hore v chate) → chat zmizne u oboch

### 2.5 AI funkcie
1. **AI Icebreaker** (v chate) — generuj 3 hlášky → odpočíta 3–5 kreditov
2. **AI Profile Review** → výstup v EUR ak je pricing
3. **AI Date Planner** → návrh schôdzky v meste

### 2.6 Reporting / Block
1. U2 reportuje U1 (dôvod: spam) → toast, profil mizne
2. Skús kontaktovať blokovaného → 403/skrytý

### 2.7 24h refund window
1. Po platbe za premium feature → over že do 24h je v profile tlačidlo "Refund"
2. Klikni → potvrď → kredity sa vrátia, audit log záznam

---

## 3. BEST FRIEND — `/best-friend`

### 3.1 AI Best Friend chat
1. U1 otvorí `/best-friend`
2. Vyberie / vytvorí svojho AI priateľa (meno, osobnosť, avatar)
3. Pošle správu → over že AI odpovedá (Lovable AI Gateway)
4. Sleduj kredity — každá správa odpočíta X kreditov
5. U3 (0 kreditov) → 402 modal "Doplň kredity"

### 3.2 Personalizácia
1. Edit osobnosti BF → over že tón odpovedí sa zmení
2. Nahraj voice → over že AI reaguje (ak je voice mode)
3. Zmeň jazyk → AI odpovedá v SK/EN/DE

### 3.3 História
1. Zatvor a otvor stránku → konverzácia zachovaná
2. Klikni **Vymazať históriu** → potvrď → prázdne

### 3.4 Multi-user
- Best Friend je 1:1 (AI), ale over že U2 nevidí konverzáciu U1 cez priamy link → 403
- Skontroluj `messages` tabuľku v Network — `user_id` filter musí byť aktívny

---

## 4. MEMBERSHIP COMMUNITY — `/membership-community`

### 4.1 Discovery
1. U1 otvorí `/membership-community`
2. Hero video hrá, zoznam komunít sa načíta
3. Filter podľa kategórie, ceny, jazyka
4. Klikni komunitu → detail (popis, počet členov, tier ceny v EUR)

### 4.2 Predplatné (Stripe)
1. U1 klikne **Subscribe** na tier €9.99/mes
2. Stripe checkout otvorí sa s €
3. Karta `4242…` → success → redirect na komunitu (member-only obsah viditeľný)
4. U2 karta `4000 0025 0000 3155` → 3DS challenge → potvrď → success
5. U3 karta declined → error, žiadny prístup

### 4.3 Member-only obsah
1. Nelogovaný (incognito) na komunita-only post → 401/lock screen
2. U1 (predplatiteľ) vidí posty, môže komentovať
3. U3 (nepredplatiteľ) → blur + "Subscribe to view"

### 4.4 Tvorca komunity
1. Vytvor vlastnú komunitu (ak má role) → názov, popis, cena, 3 tier-y
2. Publish post (text, foto, video, paywall)
3. Over že **85/15 split** sa zobrazí v earnings dashboard
4. Pozri payouts → musí byť v EUR

### 4.5 Členské akcie
1. Member: like, comment, share
2. Owner: pin post, delete cudzí komentár, ban člena
3. Bannutý U2 → 403 pri vstupe
4. Cancel subscription → over že do konca obdobia prístup ostáva

### 4.6 Multi-user realtime
1. U1 publikuje post → U2 (predplatiteľ) v druhom okne realtime vidí nový post
2. U2 komentuje → U1 vidí komentár bez refresh
3. Notifikácia bell u oboch

---

## 5. MESSENGER — `/messenger`

### 5.1 Conversation list
1. U1 otvorí `/messenger`
2. Zoznam konverzácií, search, filter (unread, archived)
3. Klikni konverzáciu s U2

### 5.2 1:1 chat
1. Pošli text → U2 vidí realtime
2. Emoji picker → vlož emoji
3. Sticker, GIF
4. Foto (drag&drop + file picker, max 10MB test)
5. Video (max 50MB test)
6. Voice message (record, play, delete pred odoslaním)
7. Edit poslednú správu → "edited" badge
8. Delete → "Táto správa bola vymazaná" placeholder
9. Forward do inej konverzácie
10. Reply na konkrétnu správu (quote)

### 5.3 Indikátory
1. **Typing**: U1 píše → U2 vidí "U1 píše…"
2. **Read receipts**: U2 prečíta → U1 vidí ✓✓ modré
3. **Online status**: zelená bodka

### 5.4 Group chat
1. U1 vytvorí skupinu (U2, U3, U4)
2. Pomenuj, nahraj foto skupiny
3. Pošli správu → všetci vidia
4. Admin (U1) pridá/odoberie člena
5. U4 odíde → notifikácia "U4 left"

### 5.5 Voice/Video call
1. U1 → U2 volanie (voice) → U2 prijme → over audio
2. Video call → over kameru, mute, end
3. U3 hovor zmeškal → "Missed call" v chate

### 5.6 Notifikácie
1. U2 zatvorí tab → U1 pošle správu → U2 dostane push (ak povolené) + chime
2. Bell ikona ukazuje counter

### 5.7 Bezpečnosť
1. Pošli text s `<script>alert(1)</script>` → musí byť escaped, NIE spustený
2. Pošli email/telefón → PII masking (ak je povolený) zobrazí `***@***`
3. Spam test: 20 správ za 5s → rate-limit 429
4. Block U2 → U2 nemôže poslať správu
5. Mute U2 → správy prichádzajú bez notifikácie

### 5.8 RLS
1. V Network nájdi `messages` request
2. Skús v incognito získať správu inej konverzácie → 403

---

## 6. MEGAFORUM — `/megaforum`

### 6.1 Discovery
1. U1 otvorí `/megaforum`
2. Zoznam kategórií/topics, search, sort (new, hot, top)
3. Klikni topic → vlákno

### 6.2 Vytvorenie postu
1. **New topic** → title, body (markdown/rich-text), kategória, tagy
2. Nahraj obrázok
3. Publish → over že sa zobrazí na vrchu
4. Edit (do 15 min) → "edited" badge
5. Delete vlastný post

### 6.3 Odpovede / komentáre
1. U2 odpovedá na U1 post → U1 dostane notifikáciu
2. Nested reply (max hĺbka)
3. Quote, mention `@U1` → notifikácia U1
4. Upvote / downvote → counter sa mení realtime

### 6.4 Moderácia
1. Report post (spam, abuse) → admin queue
2. Mod (ak je) → pin, lock thread, delete cudzí post
3. Ban užívateľa → U2 už nemôže postovať

### 6.5 Multi-user realtime
1. U1 píše post, U2 a U3 majú feed otvorený → vidia nový post bez refresh
2. U2 reaguje → U1 realtime counter ++
3. U3 reportuje → U1 nevidí change, ale admin (U-admin) áno

### 6.6 Search & filter
1. Vyhľadaj kľúčové slovo → relevantné posty
2. Filter podľa autora, kategórie, dátumu
3. Bez výsledkov → empty state

---

## 7. CHARACTER COMPANIONS — `/ai-companions`, `/character-gallery`, `/companion-chat/:id`

### 7.1 Galéria
1. U1 otvorí `/character-gallery`
2. Zoznam postáv (oficiálne + user-generated)
3. Filter: kategória, popularita, jazyk
4. Klikni postavu → preview (avatar, popis, sample chat)

### 7.2 Chat s postavou
1. **Start chat** → otvorí `/companion-chat/:id`
2. Pošli správu → AI odpovedá v role-play tóne
3. Kredity odpočítavané (sleduj counter)
4. U3 (0 kreditov) → 402 modal
5. Voice mode (ak je) → over TTS
6. Zmeň jazyk → AI odpovedá v inom jazyku

### 7.3 Vytvorenie vlastnej postavy — `/create-character`
1. Klikni **Create**
2. Vyplň: meno, popis, osobnosť (prompt), greeting, avatar (upload alebo AI generated)
3. Tagy, viditeľnosť (private/public)
4. Publish → over že sa zjaví v galérii (ak public)
5. Edit / Delete vlastnú

### 7.4 Character Arena / Battle — `/character-arena`, `/character-battle`
1. U1 vyberie 2 postavy → battle
2. AI generuje súboj (text/obrázky)
3. Kredity odpočítané
4. Výsledok uložený do histórie
5. **Multi-user**: U1 vs U2 postava → over že obaja vidia výsledok, realtime hlasovanie publika

### 7.5 RLS
1. Privátna postava U1 → U2 cez priamy `/companion-chat/:id` → 403/skrytá

---

## 8. EMOTION ECONOMY — `/emotion-economy`

### 8.1 Onboarding
1. U1 otvorí `/emotion-economy`
2. Hero, vysvetlenie systému (emócie ako mena/aktívum)
3. Klikni **Start** / **Enter**

### 8.2 Záznam emócie
1. Vyber emóciu (joy, sadness, anger, calm…)
2. Intenzita (slider 1–10)
3. Text/voice popis
4. Submit → over že sa pripočíta do peňaženky/dashboard

### 8.3 Burza emócií
1. Zobraz market — over že ceny sú v EUR (alebo internal token)
2. Buy emotion NFT/token od iného usera
3. Sell vlastný → over Stripe alebo internal balance
4. U3 (0 zdroje) → 402

### 8.4 Sociálne
1. U1 podelí emóciu s U2 (gift)
2. U2 dostane notifikáciu
3. Public feed emócií — filter, like, comment
4. Report nevhodný obsah

### 8.5 AI analýza
1. **Analyze my mood** → AI report z histórie emócií
2. Kredity odpočítané
3. Export PDF/CSV reportu

### 8.6 Multi-user
1. U1, U2, U3 zaznamenajú emócie naraz → leaderboard/community pulse sa aktualizuje realtime
2. U1 a U2 dohodnú "emotion swap" → over RLS, žiadny tretí to nevidí

### 8.7 Bezpečnosť
1. PII v texte → maskovanie
2. XSS v popise → escaped
3. Rate limit na submit (max 10/min)

---

## 9. INVITE FRIEND — `/invite` / referral link

### 9.1 Generovanie linku
1. U1 otvorí Invite friend
2. Over že referral code/URL je viditeľný (`uniqueapp.fun/?ref=XYZ`)
3. Copy button → schránka
4. Share: WhatsApp, FB, Email, X — over že otvorí share dialog

### 9.2 Registrácia cez referral
1. Otvor link v incognito → registračná stránka pre-fill ref
2. Zaregistruj nového usera U5
3. Over že U5 má v profile `referred_by = U1`
4. U1 dostane notifikáciu "U5 sa pridal cez tvoj link"

### 9.3 Odmena
1. Po splnení podmienok (napr. U5 prvá platba) → U1 dostane kredity/bonus
2. Over záznam v `referral_payouts` (alebo ledger)
3. Suma v EUR

### 9.4 Anti-fraud
1. U1 sa pokúsi pozvať sám seba (rovnaké IP / device fingerprint) → blokácia
2. Refundovaný customer → referral bonus revoked

### 9.5 Leaderboard
1. Over `/referral-leaderboard` — top referreri
2. U1 vidí svoju pozíciu
3. Mesačný reset (over cron alebo manuálne)

### 9.6 Multi-user
1. U1 pozve U2, U3, U4 cez rôzne kanály → over že každý je správne attribute-ovaný
2. U2 pozve U5 → over že U1 NEdostáva bonus za U5 (žiadne multi-level)

---

## 10. CROSS-MODULE (povinné)

### 10.1 Kredity consistency
- Po každej akcii (Anonymous reveal, Dating super-like, BF chat, Companion chat, Emotion AI) over že **stav kreditov** je rovnaký v:
  - hornom baneri
  - `/profile` → wallet
  - `/credits` strana
  - DB záznam (Network response)

### 10.2 EUR-only audit
- Otvor každý modul → search v Network responses na `"USD"`, `"CZK"`, `"HUF"` → musí byť 0 výskytov
- UI cenovky všade `€`

### 10.3 i18n
- Prepínaj EN ↔ SK ↔ DE ↔ FR ↔ ES v každom module
- Žiadne `__MISSING__` ani holé kľúče typu `dating.cta.start`

### 10.4 RLS audit (curl)
```
curl -i "https://<project>.supabase.co/rest/v1/messages?select=*" \
  -H "apikey: <ANON_KEY>"
```
Očakávaj prázdne `[]` alebo 401, NIKDY cudzie dáta.

Opakuj pre tabuľky: `anonymous_dating_profiles`, `dating_matches`, `messenger_conversations`, `community_subscriptions`, `companion_chats`, `emotion_entries`, `referrals`.

### 10.5 Race conditions
1. Dva taby U1 → simultánne klikni "Reveal anonymous profile" → over že kredit sa odpočíta IBA RAZ
2. Dva taby → simultánne subscribe komunitu → iba 1 záznam
3. Dva taby → simultánne send same message → iba 1 záznam

### 10.6 Age gate 18+
- U4 (17 r.) musí byť blokovaný v: Dating, Anonymous Date, Emotion Economy (ak má adult tag), niektoré Character postavy
- U4 môže: Messenger (s kamarátmi), Megaforum (read-only?), Best Friend (SFW), Invite friend

### 10.7 Notifikácie
- Pre každú akciu generujúcu notifikáciu (match, message, mention, referral) over:
  - Bell counter ++
  - Push (ak povolené)
  - Email digest (po 24h)
  - Klik na notifikáciu → správny deep link

### 10.8 Realtime sharding
- Otvor 5 tabov U1 v Messenger → over že WS connection sa nezasekne
- Pošli 100 správ rýchlo → over že žiadna sa nestratí

---

## 11. PERFORMANCE

1. Lighthouse mobil na každú stránku → Performance ≥ 70, A11y ≥ 90
2. TTI < 5s, LCP < 2.5s, CLS < 0.1
3. Memory: otvor Messenger, pošli 200 správ → Chrome Task Manager: nárast < 50MB
4. Network throttle "Slow 3G" → over že UI je použiteľné, skeleton loadery sa zobrazia

---

## 12. REPORTING TEMPLATE

```
Modul:        [napr. Dating]
Sekcia:       [napr. 2.4 Match]
Krok:         [presné číslo]
URL:          [/dating]
Účet:         [U1]
Reprodukcia:  1. ... 2. ... 3. ...
Očakávané:    [...]
Skutočné:     [...]
Console:      [chyba]
Network:      [status, endpoint]
Screenshot:   [link]
Priorita:     P0 / P1 / P2
```

---

## 13. ODPORÚČANÉ PORADIE TESTOV

**P0 (kritické):** Messenger → Dating → Anonymous Date → RLS audit → Kredity audit
**P1 (vysoké):** Membership Community (platby!) → Best Friend → Invite friend → Notifikácie
**P2 (stredné):** Megaforum → Character Companions → Emotion Economy
**Cross/Final:** EUR audit → i18n → Race conditions → Age gate → Performance
