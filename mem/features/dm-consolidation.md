---
name: DM consolidation onto conversations
description: Direct messages now use unified conversations schema via get_or_create_dm_conversation RPC; legacy direct_messages deprecated.
type: feature
---

## What changed
- `conversation_messages` extended with `message_type`, `audio_url`, `audio_duration`, `reply_to_id`, `edited_at`, `is_read`.
- New SECURITY DEFINER RPC `get_or_create_dm_conversation(_other_user uuid)` finds (or lazily creates) the single 1:1 conversation between caller + counterpart.
- `useDirectMessages` rewritten: same external API, internals now read/write `conversation_messages` and use the RPC.
- `useVoiceMessages` migrated to the same path.

## Deprecated
- `public.direct_messages` table — 0 rows at cutover, kept temporarily for safety. Drop in follow-up once monitoring confirms no callers.

## Anonymous Dating clarification
- `pay-anonymous-date-access` is already subscription-only (`mode: subscription`, €1/month, price `price_1SZr6QGaXSfGtYFtT7ccy644`).
- No per-date payment exists. Credit packs (`create-anonymous-date-payment`) cover premium consumables (hints, gifts, voice). Both flows are intentional.
