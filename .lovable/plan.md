# Rewarded Video Ads → Weekly XP

Pridáme „Pozri reklamu za +25 XP" tlačidlo do appky. Po dopozeraní reklamy server overí udalosť a pripočíta XP do `weekly_xp`.

## Konfigurácia

- **Odmena:** +25 weekly_xp za jednu dopozeranú reklamu
- **Cooldown:** 60 sekúnd medzi reklamami (server-side)
- **Denný limit:** žiadny
- **Providery:** Google AdSense (web/PWA) + Google AdMob (Capacitor natívne)

## Backend

### Tabuľka `ad_reward_log`
- `user_id`, `provider` (`adsense`/`admob`), `ad_unit_id`, `xp_granted`, `client_token`, `verified_at`
- RLS: user vidí len svoje záznamy, insert iba cez edge function (service role)
- Index na `(user_id, verified_at DESC)` na rýchly cooldown lookup

### Edge function `claim-ad-reward`
1. Overí JWT používateľa
2. Skontroluje cooldown (posledný `verified_at` < 60s → 429)
3. Validuje `client_token` (jednorazový nonce vygenerovaný pri začatí reklamy)
4. Zapíše do `ad_reward_log`
5. Pripočíta +25 do `weekly_xp` (existujúca tabuľka/funkcia)

### Edge function `start-ad-session`
- Vygeneruje krátkodobý `client_token` (5 min TTL), uloží do `ad_sessions`
- Vráti token frontend-u; ten ho pošle späť pri `claim-ad-reward`
- Bráni spoofovaniu „dostal som XP bez pozretia reklamy"

## Frontend

### `src/lib/ads/`
- `adProvider.ts` – detekuje runtime (Capacitor → AdMob, inak AdSense)
- `useRewardedAd.ts` – hook: `{ showAd, isLoading, cooldownRemaining }`
- `AdSenseRewarded.tsx` – Google AdSense Rewarded slot
- `AdMobRewarded.tsx` – Capacitor plugin (`@capacitor-community/admob`)

### UI komponent `<WatchAdButton />`
- Tlačidlo „Pozri reklamu za +25 XP"
- Zobrazí cooldown countdown ak <60s od poslednej
- Po úspechu toast „+25 XP!" + invaliduje XP query

### Integrácia
- Pridáme `<WatchAdButton />` do:
  - Profile dashboard (hlavné miesto)
  - Po vyčerpaní AI kreditov (dialog „Doplň cez reklamu alebo kúp")
  - Weekly leaderboard stránka

## Secrets potrebné

- `ADSENSE_PUBLISHER_ID` (formát `ca-pub-...`) – frontend, ale ulož ako env
- `ADSENSE_REWARDED_SLOT_ID` – konkrétne ad unit
- `ADMOB_APP_ID_ANDROID`, `ADMOB_APP_ID_IOS`
- `ADMOB_REWARDED_UNIT_ID_ANDROID`, `ADMOB_REWARDED_UNIT_ID_IOS`

Tieto získaš v:
- AdSense: https://www.google.com/adsense → Ads → By ad unit → Rewarded
- AdMob: https://apps.admob.com → Apps → Ad units → Rewarded

## Rozsah implementácie (čo postavím teraz)

1. Migrácia: `ad_reward_log` + `ad_sessions` tabuľky + RLS
2. Edge functions: `start-ad-session`, `claim-ad-reward`
3. Frontend: `adProvider.ts`, `useRewardedAd.ts`, `WatchAdButton.tsx`
4. AdSense web integrácia (funguje hneď v prehliadači)
5. AdMob skeleton (aktivuje sa keď spravíme Capacitor build neskôr)
6. Vloženie `<WatchAdButton />` na 3 miesta (profile, AI credits dialog, leaderboard)

## Čo NIE je v tomto plane (neskôr)

- Capacitor setup pre natívne appky (App Store / Play Store) – riešime po Stripe
- Interstitial / banner reklamy
- A/B testovanie odmeny (25 vs 50 XP)
- Admin dashboard štatistík reklám

## Potrebujem od teba po schválení

AdSense + AdMob ID-čka (alebo si ich vytvoríš až keď budú edge funkcie hotové – môžem dať placeholder a appka bude bežať v test móde).
