# QA — CreativeForge (P0)

**URL:** `/creative-forge` | **Kredity:** 3–5 / generácia | **Účty:** A, B, C

## A. Prístup & načítanie
1. Otvor `/creative-forge` ako A → hero, 8 sub-tool karty viditeľné, žiadne console errors
2. Odhlás → otvor URL → redirect na `/auth` alebo gate
3. Light + dark mode toggle → farby OK, žiadne `text-white` na bielom
4. Mobile 360px → karty stackujú, žiadny horizontal scroll
5. Sieť offline → graceful fallback, žiadny biely screen
6. Reload (F5) → state perzistuje (rozpracovaný projekt), kreditový display OK

## B. Sub-tooly (každý zvlášť, účet A)
Pre **každý** z 8 sub-toolov (Logo, Banner, Social Post, Ad Copy, Hashtags, Captions, Scripts, Thumbnails):
1. Klik na sub-tool kartu → otvorí sa modal/page
2. Vyplň prompt (3 slová) → klik Generate → loader, network `POST /functions/v1/creative-forge-*`
3. Počkaj výsledok → preview rendered, kredity zdecrementované (sleduj badge)
4. Klik Download/Export → súbor stiahnutý správneho formátu (PNG/JPG/TXT/MP4)
5. Klik Regenerate → ďalšia generácia, ďalšie kredity stiahnuté
6. Klik Save to Library → uložené, zobrazí sa v "My Creations"
7. Klik Share → link skopírovaný, otvorí sa zdieľaný view v incognito
8. Prázdny prompt → tlačidlo disabled alebo validation error
9. Prompt >500 znakov → orezané alebo error message
10. Špeciálne znaky `<script>alert(1)</script>` → sanitizované, žiadny XSS
11. Presets/štýly dropdown → vyber 3 rôzne → každý vygeneruje iný výsledok
12. Color picker (Logo/Banner) → zmena farby → reflectne v preview

## C. Kredity & billing (účet C, 5 kreditov)
1. Otvor sub-tool s cenou 5 → Generate → OK, ostane 0
2. Skús ďalšiu → "Insufficient credits" dialog, CTA "Buy credits"
3. Klik Buy credits → Stripe checkout otvorí, EUR cena
4. Cancel → vráti na modul, kredity 0
5. Test karta 4242 → success → kredity pridané, modul pokračuje
6. Decline karta → error toast, kredity stále 0

## D. Error handling
1. Network kill počas Generate (DevTools offline) → timeout error, kredity vrátené (overiť v `/credits` history)
2. Server 500 mock (alebo realne) → error toast, retry button
3. Pomalá odpoveď >30s → loading state, žiadne zamrznutie UI
4. Duplicate rapid click Generate (5x za 2s) → rate limit 429 alebo len 1 request

## E. Multi-user (A + B súčasne)
1. A otvorí Logo tool, generuje → B v inom okne otvorí Banner tool, generuje súčasne → obaja dostanú vlastné výsledky
2. A vytvorí Public Logo v Library → B vidí v `/explore` alebo public gallery (ak existuje)
3. A zdieľa link → B otvorí → vidí read-only view
4. A zmaže výtvor → B refresh share link → "Not found"

## F. RLS / Security
1. Network tab → skopíruj user_id z B → nahrad v request → 403
2. Priamy DB request na cudzí draft → blocked
3. Storage URL signed, expires <1h

## G. Persistencia & "My Creations"
1. Vygeneruj 5 výtvorov v rôznych sub-tooloch → "My Library" zobrazí všetky 5
2. Filter podľa typu → funguje
3. Delete → confirm dialog → zmazané z UI + DB
4. Reload → stále zmazané

## H. i18n
1. Prepni SK → všetky tlačidlá preložené, prompt placeholder SK
2. Prepni DE/FR/CZ → rovnaké
3. Generuj v SK jazyku prompt → AI odpovedá v SK (ak podporuje)
