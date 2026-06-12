---
name: DM consolidation onto conversations
description: Direct messages use unified conversations schema via get_or_create_dm_conversation RPC; legacy direct_messages dropped.
type: feature
---

## What changed
- `conversation_messages` extended with `message_type`, `audio_url`, `audio_duration`, `reply_to_id`, `edited_at`, `is_read`.
- SECURITY DEFINER RPC `get_or_create_dm_conversation(_other_user uuid)` finds or lazily creates the single 1:1 conversation between caller + counterpart.
- `useDirectMessages` and `useVoiceMessages` read/write `conversation_messages` only.
- Legacy `public.direct_messages` table **dropped** (was 0 rows, no callers).

## Anonymous Dating clarification
- `pay-anonymous-date-access` is subscription-only (€1/month, price `price_1SZr6QGaXSfGtYFtT7ccy644`).
- Credit packs (`create-anonymous-date-payment`) cover premium consumables. Both flows intentional.
