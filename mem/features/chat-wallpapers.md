---
name: Chat wallpapers (platform-wide, shared per conversation)
description: 112 wallpapers (48 adult photographic + 4 kids); the most recently changed choice among chat participants is shown to everyone in that chat.
type: feature
---

## Rule
Chat background is stored per user in `messenger_chat_themes.wallpaper_id` (+ `owned_themes`), but inside a conversation ALL participants see the wallpaper/theme of whoever changed it most recently ("last change wins").

## Implementation
- Catalog: `src/data/chatWallpapers.ts` — 112 templates (48 photographic via `src/data/chatWallpaperImages.ts`, gradients/patterns CSS, 4 free Kids). Prices 0/2/3/4 credits via `deduct_ai_credits`.
- Legacy ids kept: `abstract`, `stars`, `bubbles`, `matrix`.
- DB: security-definer RPC `get_shared_chat_theme(_peer_ids uuid[])` returns the single most recently updated theme row among caller + peers; trigger `trg_touch_messenger_chat_themes` keeps `updated_at` fresh.
- `useChatTheme.ts` exports `chatBackgroundStyle`, `wallpaperPreviewStyle`, `resolveWallpaper`, `useSharedChatTheme(userId, peerIds)` and `useChatBackground(peerIds?)`.
- Applied in: Messenger (peer = active conversation partner), Wall DirectMessagesDialog, AnonymousChat, CreatorMessaging, BazaarOrderChat, marketplace OrderChat, ConcertChat (no peer = own theme). AI chatbots excluded.
- Messenger keeps the background on a fixed-height absolute layer so long conversations never stretch/blur it.
