
## Stav modulu Live Concerts (audit)

### Čo funguje ✅
- **Hub** `/live-concerts` — auth guard, 20 nástrojov, How-It-Works.
- **Registrácia hudobníka** (`MusicianRegistration` → `musician_profiles`).
- **Musician Dashboard** `/musician-dashboard` — Schedule Concert (vloží do `live_concert_streams`), TicketPricingManager (insert do `concert_ticket_types`), EarningsDashboard.
- **Browse Concerts** — list `scheduled/live` koncertov + Buy Ticket → `create-concert-ticket-checkout` → cez `proxyMap` smerované na `create-checkout` (product=`concert_ticket`), splits 80/20, Stripe checkout v novom tabe.
- **Verify** `verify-concert-ticket-payment` + `useOneOffPaymentVerify` na návrate.
- Vedľajšie nástroje (gifts, setlist voting, song requests, merch, leaderboard, replays, chat, stories, collectibles, afterparty, multi-camera) — existujú ako samostatné komponenty.

### Kritická diera ❌
**Neexistuje žiadna stránka, kde by sa koncert dal naživo VYSIELAŤ ani SLEDOVAŤ.**
- `MusicianDashboard` nemá tlačidlo „Go Live" pre koncert (existuje len `GoLiveButton` pre influencer `live_streams`, nie pre `live_concert_streams`).
- `live_concert_streams` má pole `stream_key`, ale žiadny `playback_url`/`hls_url`/`ingest_url`.
- V `App.tsx` chýba routa typu `/concert-watch/:id`. Po kúpe lístka nemá kupujúci kde sledovať.
- `MultiCamera` je čisto mockup (žiadny video element).

### Plán opráv

**1. DB migrácia — pridať streaming polia na `live_concert_streams`**
- `ingest_url text` (RTMP/WHIP endpoint pre vysielateľa)
- `playback_url text` (HLS .m3u8 pre divákov)
- `started_at timestamptz`, `ended_at timestamptz`
- `viewer_count int default 0`

**2. Edge function `concert-go-live`** (verify_jwt)
- Vstup: `concertId`. Overí, že volajúci = `musician_profiles.user_id` pre tento koncert.
- Vygeneruje deterministický stream key (alebo prijme externe nastavený), vyplní `ingest_url` + `playback_url` (placeholder formát — používateľ si neskôr napojí Mux/Cloudflare/Livepeer; teraz schéma `rtmp://stream.uniqueapp.fun/live/<key>` a `https://stream.uniqueapp.fun/hls/<key>.m3u8`).
- Status → `live`, `started_at = now()`.

**3. Edge function `concert-end-stream`** — status → `ended`, `ended_at = now()`.

**4. Tlačidlá v `MusicianDashboard`** pri každom koncerte: **Go Live / End Stream / Copy RTMP key** (dialog s návodom: OBS → Server `ingest_url`, Stream Key).

**5. Nová routa `/concert-watch/:id`** + stránka `ConcertWatch.tsx`
- Server-side guard: musí mať platný `concert_ticket_purchases` riadok pre `auth.uid()` na tomto koncerte (alebo byť sám hudobník).
- HLS player (hls.js, fallback na natívne Safari).
- Sidebar: `ConcertChat` (už existuje), tlačidlá Send Gift / Song Request / Vote Setlist.
- Realtime increment `viewer_count` cez Supabase channel presence.

**6. „Watch Now" v `BrowseConcerts`** keď `status='live'` a používateľ má lístok → navigate `/concert-watch/:id`. Inak Buy Ticket.

**7. RLS audit**
- `concert_ticket_purchases` SELECT len `holder = auth.uid()` alebo hudobník.
- `live_concert_streams` SELECT public pre scheduled/live (browse), UPDATE len owner musician.

**8. Mobil + UX**
- Hub a Watch stránka: `pt-20 pb-28 md:pb-8`.
- Watch: video 16:9 responsive, chat collapse na mobile.

**9. Testovanie Nathalie**
- Skript: register musician → schedule → set prices → go live → druhý user kúpi lístok (test card) → verify success → watch stránka prehrá HLS (alebo zobrazí „Stream sa pripravuje"), chat funkčný → end stream → status `ended`.

### Otvorené otázky pred implementáciou

1. **Streamovací backend:** Postaviť na **placeholder URL** (RTMP/HLS schéma) s tým, že napojenie reálneho providera (Mux / Cloudflare Stream / Livepeer) doplníme neskôr cez secret? Alebo preferuješ rovno integrovať Mux/Cloudflare (vyžaduje API kľúč ako secret)?
2. **Replay nahrávky:** chceš automatické ukladanie ended streamov do `ConcertReplay` (potrebuje provider podporujúci recording)?
