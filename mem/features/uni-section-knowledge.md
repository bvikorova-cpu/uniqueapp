---
name: Uni section knowledge base
description: Uni answers in depth about every section using _shared/uniSections.ts + uniSectionsExtra.ts; facts must match code
type: feature
---

# Uni knowledge base

- Uni costs 2 credits per reply.
- Authoritative section facts live in `supabase/functions/_shared/uniSections.ts` (core) and `uniSectionsExtra.ts` (all remaining sections: Wall, Messenger, credits, rewards, referral, earnings/fees, subscriptions, Kids, Teen, Education, Bazaar, Auction, Skills, Jobs/Promotions/Property, Creators, games, challenges, wellness, nutrition, cooking, dating, AI tools, mystical, brand arena, special modules).
- `matchSectionDocs(text, 4)` injects up to 4 matching docs into the prompt. Uni must never invent facts outside these docs.
- When a price, split or feature changes in code, update the matching doc in the same change.
