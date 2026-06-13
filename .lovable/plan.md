# Plán: doplnenie všetkých 271 chýbajúcich edge funkcií

Audit (`MISSING_EDGE_FUNCTIONS.md`) ukázal 14 kategórií. Idem postupne, po moduloch — každý modul = jedna iterácia: implementácia → deploy → test → ďalej.

## Fáza 1 — Platby (najvyšší dopad, 118 funkcií)
Väčšina sú varianty `create-checkout-*` a `verify-*-payment`. Namiesto 118 samostatných:
1. **Rozšíriť univerzálny router** `create-one-off-payment` + `_shared/oneOffCheckout.ts` (PRODUCTS catalog) o všetky chýbajúce productKeys.
2. **Pridať proxy mapovanie** v `src/integrations/supabase/proxyMap.ts` — staré názvy → router (vzor už existuje).
3. **Jeden univerzálny `verify-payment`** s routovaním podľa `metadata.type` (kde treba DB side-effect, pridať konkrétne `verify-*`).
4. Pre subscriptions doplniť do `create-checkout` routera nové `subscriptionType`.

Výsledok: 118 → ~10 reálnych funkcií + mapping.

## Fáza 2 — AI moduly po hub-och (cca 80 funkcií)
Pre každý hub jeden router pattern (ako `brain-duel-router`):
- **Virtual Pet** (8) → `pet-ai-router` (mood, battle, food-scan, …)
- **Nutrition** (9) → `nutrition-ai-router` (barcode, meal-plan, …)
- **Beauty** (6) → `beauty-ai-router`
- **Antiques** (9) → `antiques-ai-router`
- **Shadow Arena** (9) → `shadow-arena-router`
- **Horse** (6) → `horse-ai-router`
- **Plant** → `plant-ai-router`
- **Photo** (5) → `photo-ai-router`
- **Home** (3), **Kids** (4), **Megatalent** (2), **Brand Arena** (1) → každý vlastný router

Každý router používa Lovable AI Gateway (`google/gemini-2.5-flash` default), kreditný odpočet cez existujúce RPC.

## Fáza 3 — AI Generic (29)
Konsolidovať do `ai-generic-router` s `action` parametrom.

## Fáza 4 — Other / Uncategorized (62)
Audit po jednej, väčšina budú:
- staré názvy (pridať do proxyMap),
- mŕtvy kód (odstrániť invoke z frontendu),
- malé samostatné funkcie (implementovať).

## Pracovný postup pre každý hub
1. Vygenerujem router + zmažem invokes na neexistujúce funkcie (alebo pridám proxy).
2. `supabase--deploy_edge_functions` daný router.
3. `supabase--curl_edge_functions` smoke test.
4. Označím modul ako hotový v `MISSING_EDGE_FUNCTIONS.md`.

## Časový odhad
- Fáza 1: 1 iterácia (~veľký diff, ale mechanický).
- Fáza 2: 12 iterácií (1 per hub).
- Fáza 3: 1 iterácia.
- Fáza 4: 2-3 iterácie.

**Spolu ~17 krokov.** Po každej fáze ti dám report + pokračujeme.

## Začínam s
Fáza 1 (platby) — odblokuje najviac UI naraz. Súhlasíš, alebo chceš začať iným hub-om (napr. Virtual Pet, kde sme našli bug)?
