# Chatové pozadia pre celú platformu

## Cieľ
Používateľ si vyberie pozadie raz a platí pre všetky chaty na platforme. Katalóg 60+ šablón vrátane 4 detských.

## Katalóg pozadí (~64 šablón)
Definované ako CSS gradienty + vzory (žiadne obrázky, nulová záťaž na načítanie), rozdelené do kategórií:
- Gradients (10) — čisté farebné prechody
- Neon / Cyber (8)
- Nature (8) — východ slnka, les, oceán, sakura
- Pastel / Soft (8)
- Dark / Minimal (8)
- Patterns (8) — bodky, mriežka, vlnky, kosoštvorce
- Romantic / Glow (8)
- Kids (4) — cukríky, dúha, vesmír pre deti, oceánske zvieratká

Ceny: väčšina zdarma, časť za 2–5 kreditov (rovnaká logika nákupu ako dnes, `deduct_ai_credits` + `owned_themes`). Detské pozadia zdarma.

## Kde sa použijú
Nová komponenta `ChatBackground` + hook čítajúci uloženú voľbu z `messenger_chat_themes` (bez zmien v DB):
- Messenger (už funguje, prepne sa na nový katalóg)
- Wall Direct Messages
- Anonymous Date chat
- Creator messaging
- Bazaar / Marketplace order chat
- Concert chat

AI chatboty (asistenti, terapeuti, tutori) zostávajú nezmenené.

## UI výberu
V Messenger → Chat Themes:
- záložky kategórií + vyhľadávanie podľa názvu
- veľká živá ukážka s bublinami
- označenie Free / Owned / cena, aktívne pozadie s fajkou
- ponechaný AI generátor vlastnej témy

## Technické detaily
- `src/data/chatWallpapers.ts` — katalóg (id, name, category, price, layers)
- `useChatTheme` rozšírený o resolve pozadia z nového katalógu, spätne kompatibilný so starými id (`abstract`, `stars`, `bubbles`, `matrix`)
- `src/components/chat/ChatBackground.tsx` — wrapper aplikujúci štýl na ľubovoľný chatový kontejner
- Voľba sa ukladá do existujúcich stĺpcov `wallpaper_id` / `owned_themes`
