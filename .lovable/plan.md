## Cieľ
Pridať Web Push notifikácie cez Service Worker, aby zvonenie hovorov a zvuk nových správ fungovali aj keď je appka úplne zavretá (ako Messenger).

## Architektúra

```text
[Volajúci/Odosielateľ]
    └─ INSERT do call_signals / messages
         └─ Postgres trigger → pg_net → edge function `send-push`
              └─ web-push s VAPID kľúčmi
                   └─ Push servery (FCM/APNs/Mozilla)
                        └─ Service Worker na zariadení príjemcu
                             ├─ showNotification (ringtone/message sound)
                             └─ klik → otvorí /messenger
```

## Kroky

### 1. VAPID kľúče (secrets)
- Vygenerujem VAPID public/private key pair
- `VAPID_PUBLIC_KEY` (verejný – do frontendu cez edge fn alebo env)
- `VAPID_PRIVATE_KEY` (tajný – iba pre edge fn)
- `VAPID_SUBJECT` (mailto: kontakt)

### 2. Databáza
Nová tabuľka `push_subscriptions`:
- `user_id`, `endpoint` (unique), `p256dh`, `auth`, `user_agent`
- RLS: užívateľ vidí/spravuje len svoje subscriptions

Triggery na:
- `call_signals` (type = 'offer') → zavolá edge fn `send-push` s payloadom `{kind:'call', caller, receiver}`
- `messages` (INSERT) → zavolá edge fn `send-push` s payloadom `{kind:'message', sender, conversation, preview}`

Použijem `pg_net.http_post` na asynchrónne volanie edge fn.

### 3. Service Worker (`public/sw.js`)
- `push` event: zobrazí notifikáciu, pre call typ použije `requireInteraction: true`, vibračný pattern a vlastný zvuk
- `notificationclick`: otvorí/zaostrí `/messenger` alebo `/messenger?call=<id>`
- Žiadne cachovanie HTML (kvôli Lovable preview – guard proti iframe a preview hostom)

### 4. Frontend
- `src/lib/pushNotifications.ts`: registrácia SW, `Notification.requestPermission()`, `pushManager.subscribe()`, uloženie do `push_subscriptions`
- Trigger po prihlásení a pri prvej user interakcii (nie v iframe / preview)
- UI tlačidlo „Povoliť notifikácie" v Messenger settings (ak permission = default)
- Auto-unregister SW v Lovable preview/iframe (zachovať existujúce pravidlo)

### 5. Edge funkcia `send-push`
- Vstup: `{ user_ids: string[], payload: {...} }`
- Načíta všetky subscriptions pre daných userov
- Pošle web-push cez `https://deno.land/x/web_push` (alebo manuálny VAPID JWT + fetch)
- Vymaže neplatné subscriptions (410 Gone)

## Bezpečnosť
- Edge fn je verejná, ale validuje volajúceho cez service-role-only header alebo overí JWT od pg_net
- RLS na `push_subscriptions` len pre vlastníka
- VAPID private kľúč iba v edge fn

## Obmedzenia (poviem userovi)
- iOS Safari: Push funguje len pre PWA pridanú na home screen (iOS 16.4+)
- Užívateľ musí kliknúť „Povoliť notifikácie" – browser to vyžaduje
- V Lovable preview iframe SW zámerne nezaregistrujeme

## Súbory
- nový: `public/sw.js`, `src/lib/pushNotifications.ts`, `supabase/functions/send-push/index.ts`
- migrácia: tabuľka + triggery + pg_net volania
- edit: `src/App.tsx` (registrácia SW po login), Messenger settings (opt-in tlačidlo)
- secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## Otvorená otázka
Potrebujem od teba mailto kontakt pre VAPID `subject` (napr. `mailto:admin@uniqueapp.fun`). Ak nepovieš, použijem `mailto:admin@uniqueapp.fun`.