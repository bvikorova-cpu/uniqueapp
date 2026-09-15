---
name: Chat wallpapers (platform-wide)
description: 112 wallpapers including 48 adult photographic options and 4 kids templates, chosen once and applied to all human chats.
type: feature
---

## Rule
Chat background is a per-user setting stored in `messenger_chat_themes.wallpaper_id` (+ `owned_themes` for paid ones) and applies to EVERY human chat surface.

## Implementation
- Catalog: `src/data/chatWallpapers.ts` — 112 templates. Hearts, Pets, Men, Women, Travel and Fashion use 48 mature editorial photographs; gradients/patterns remain CSS and Kids has 4 free templates. Prices 0/2/3/4 credits via `deduct_ai_credits`.
- Legacy ids kept: `abstract`, `stars`, `bubbles`, `matrix`.
- `useChatTheme.ts` exports `chatBackgroundStyle`, `wallpaperPreviewStyle`, `resolveWallpaper` and `useChatBackground()` (auto-resolves current user) for any chat container.
- Picker: `src/components/messenger/AIChatThemes.tsx` — category chips + search + live preview; AI custom theme generator unchanged.
- Applied in: Messenger, Wall DirectMessagesDialog, AnonymousChat, CreatorMessaging, BazaarOrderChat, marketplace OrderChat, ConcertChat. AI chatbots intentionally excluded.
