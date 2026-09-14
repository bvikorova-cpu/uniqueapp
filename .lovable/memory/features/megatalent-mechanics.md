---
name: Megatalent Mechanics
description: Prize split, referral program and TOP Premium ranking rules for Megatalent
type: feature
---
- Referral program applies to BOTH plans (Premium €10 and TOP Premium €15): €5/month per invited friend, recurring, credited on every paid invoice (stripe-webhook handles both tiers).
- Remainder after €5 referral is split 50% winner / 20% charity / 30% platform (Premium: €5 remainder; TOP: €10 remainder).
- TOP Premium = 2x ranking weight (real votes × 2), priority placement, exclusive badge.
- Charity beneficiary (name, type, city, website, IBAN) mandatory before first submission.
- UI texts for plans live in `src/components/megatalent/MegaTalentGuide.tsx` and `src/pages/megatalent/MegatalentSuccess.tsx`.
</content>
