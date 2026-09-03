---
name: Single credit wallet — no per-module credit tables
description: Zákaz nových *_credits tabuliek; všetky gate-y a dobíjania idú cez ai_credits + ai_credits_ledger; testovať cross-user
type: constraint
---

# Jedna peňaženka: `ai_credits`

## Zakázané
- Vytvárať akúkoľvek novú `*_credits` tabuľku pre modul.
- Čítať zostatok alebo odpisovať kredity z legacy tabuliek
  (`handwriting_credits`, `past_life_credits`, `tutoring_credits`, `phobia_credits`,
  `teen_credits`, `video_credits`, `property_parity_credits`, `secret_santa_credits`,
  `lie_detector_credits`, `dna_parity_credits`, `membership_parity_credits`,
  `reincarnation_parity_credits`, `anonymous_dating_credits`, `brand_battle_credits`, …).
- Dobíjať po Stripe platbe do inej tabuľky ako `ai_credits`.

## Povinné
- Zostatok: `select credits_remaining from ai_credits where user_id = ...`
- Odpis: RPC `deduct_ai_credits(p_user_id, p_amount, p_reason, p_source)` alebo
  `spend_ai_credits(_amount, _reason, _source)` (klient, používa `auth.uid()`).
- Dobitie: RPC `add_ai_credits(p_user_id, p_amount, p_reason, p_source)`.
- Každá zmena musí vytvoriť riadok v `ai_credits_ledger`.
- Výnimky (metadata/tier, nie peňaženka): `video_ad_credits` (tier),
  `free_tier_credits` (Creative Forge free balance).

## Prečo (incident 2026-09-03)
Moduly vznikali postupne, každý mal vlastnú kreditovú tabuľku. Po prechode na
`ai_credits` sa staré gate-y neprepli. Owner účet mal v starých tabuľkách veľké
testovacie zostatky (napr. handwriting 829, past_life 996, tutoring 1098), takže
u neho všetko fungovalo; noví používatelia mali 0 riadkov → `Insufficient credits`.
Chyba bola viditeľná len cross-user.

## Testovacie pravidlo
Každú kreditovú funkciu overiť z DRUHÉHO, čistého účtu (nie owner účet).
Overenie v DB: pred/po zostatok v `ai_credits` + nový riadok v `ai_credits_ledger`.
