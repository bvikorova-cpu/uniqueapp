# Rewards QA — Handoff pre Nathalie

**Od:** Dev team  
**Pre:** Nathalie  
**Dátum odovzdania:** 2026-05-30  
**Deadline:** do 48h od prevzatia

---

## Čo treba spraviť

1. Prihlás sa do test buildu nižšie uvedenými údajmi.
2. Prejdi **všetky kroky** v `docs/REWARDS_QA_CHECKLIST.md` (alebo priloženom `REWARDS_QA_CHECKLIST_Nathalie.md`).
3. Pri každom kroku zaškrtni ☐ → ☑ a doplň Notes ak niečo zlyhalo (vrátane console/network errorov).
4. Na konci sa podpíš a vráť vyplnený dokument dev tímu.

## Prístup

- **URL (preview):** https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app
- **URL (prod):** https://uniqueapp.fun
- **Test účet:** `beata.vikorova@yandex.com`
- **Heslo:** `BiankaDominik25`
- **Admin panel:** `/admin/rewards-audit` (sekcia 9 v checkliste)

## Kritické flow (musia byť 100% zelené)

- Lucky Wheel spin + cooldown
- XP Bets — žiadne dvojité strhnutie XP
- Quest Path claim (single-use)
- Marketplace nákup + `insufficient_xp` guard
- Weekly leaderboard rewarded ad cooldown (30s)
- Admin `/admin/rewards-audit` — **Stuck bets = 0**, **Fraud flags** prejdené

## Eskalácia

Ak nájdeš čokoľvek červené:
1. Screenshot + console log do Notes.
2. Ping dev team v Slacku #rewards-qa.
3. Nepokračuj v dotknutom flow, ostatné sekcie dokonči.

## Sign-off

Po dokončení vyplň posledný riadok checklistu:

> **Sign-off:** ☑ All critical paths green → **Nathalie** ___________ **Date** __________

Vyplnený súbor pošli späť ako `REWARDS_QA_CHECKLIST_Nathalie_SIGNED.md`.
