---
name: Marketplace contact filter
description: Server trigger + client mask that strips e-mails, phones, links, social handles and skype/telegram/whatsapp from listings and early chat; contact unlock costs 2 credits.
type: feature
---

- DB: `public.scrub_contact_info(text)` + triggers on `skill_offerings`, `skill_requests`, `properties` (title/description), `marketplace_responses.message` (until a `skill_contact_unlocks` row exists for buyer or seller) and `property_messages.content` (first 3 messages per property+buyer). Replacement marker: `[contact hidden]`.
- Client mirror for legacy rows: `src/lib/contactMask.ts` (`maskContactInfo`, `hasContactInfo`) — applied in SkillsMarketplace cards, SkillOfferingDetail, SkillRequestsBoard, PropertyCard, PropertyDetailDialog, and the first 3 messages of Skill/Property chat dialogs.
- `unlock_skill_contact` RPC charges **2 credits** (ledger reason `skills_marketplace_contact_unlock`, max 20 unlocks/day). All UI copy says 2 credits.
