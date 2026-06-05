# Rewards QA — Nathalie Quick Start (kopíruj & pošli)

---

**Ahoj Nathalie,**

prosím o preklikanie Rewards sekcie podľa nižšie uvedených údajov. **Deadline: do 48h.**

## 🔑 Prístupové údaje

| | |
|---|---|
| **URL (preview)** | https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app |
| **URL (prod)** | https://uniqueapp.fun |
| **Email** | _1Password vault: `Rewards QA` (ping #rewards-qa)_ |
| **Heslo** | _1Password — nikdy v repozitári_ |
| **Admin panel** | `/admin/rewards-audit` |

## ✅ Checklist (25+ krokov)

Kompletný checklist: `docs/REWARDS_QA_CHECKLIST_Nathalie.md` (priložený v repozitári)

**Kritické flow, ktoré musia byť 100% zelené:**
1. Lucky Wheel spin + cooldown (žiadne duplicitné výhry)
2. XP Bets — overiť že sa nedá 2x draw na rovnakú stávku
3. Quest Path claim (single-use questy)
4. Marketplace nákup + `insufficient_xp` guard (nedá sa kúpiť bez XP)
5. Weekly leaderboard + 30s ad cooldown
6. Admin `/admin/rewards-audit` — **Stuck bets = 0**, **Fraud flags** prejdené

## 🚨 Pri chybe

1. Screenshot + console log do Notes
2. Pingni dev team v Slacku **#rewards-qa**
3. Nepokračuj v dotknutom flow, ostatné sekcie dokonči

## ✍️ Sign-off

Po dokončení zaškrtni posledný riadok checklistu:

> ☑ All critical paths green → **Nathalie** ___________ **Date** __________

Vyplnený checklist pošli späť ako `REWARDS_QA_CHECKLIST_Nathalie_SIGNED.md`.

---

**Ďakujeme!**

---

*Alternatívne — rovno skopírovať do Slacku:*

```
@Nathalie Rewards QA ready 🎯

Preview: https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app
Prod: https://uniqueapp.fun

Email + heslo: 1Password vault "Rewards QA" (ping #rewards-qa)

Checklist: docs/REWARDS_QA_CHECKLIST_Nathalie.md
Deadline: 48h

Kľúčové: Lucky Wheel, XP Bets, Quest Path, Marketplace, Leaderboard, Admin audit
Pri chybe → screenshot + #rewards-qa
```
