---
name: Chat wallpapers (platform-wide)
description: 64 CSS wallpaper templates (incl. 4 kids) in src/data/chatWallpapers.ts, chosen once and applied to all chat surfaces via useChatBackground.
type: feature
---

## Rule
Chat background is a per-user setting stored in `messenger_chat_themes.wallpaper_id` (+ `owned_themes` for paid ones) and applies to EVERY human chat surface.

## Implementation
- Catalog: `src/data/chatWallpapers.ts` — 64 pure-CSS templates, categories: gradient, neon, nature, pastel, dark, pattern, romantic, kids (4, always free). Prices 0/2/3/4 credits via `deduct_ai_credits`.
- Legacy ids kept: `abstract`, `stars`, `bubbles`, `matrix`.
- `useChatTheme.ts` exports `chatBackgroundStyle`, `wallpaperPreviewStyle`, `resolveWallpaper` and `useChatBackground()` (auto-resolves current user) for any chat container.
- Picker: `src/components/messenger/AIChatThemes.tsx` — category chips + search + live preview; AI custom theme generator unchanged.
- Applied in: Messenger, Wall DirectMessagesDialog, AnonymousChat, CreatorMessaging, BazaarOrderChat, marketplace OrderChat, ConcertChat. AI chatbots intentionally excluded.
