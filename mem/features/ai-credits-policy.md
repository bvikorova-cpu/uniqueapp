---
name: AI Credits Grant Policy
description: Striktné pravidlá pripisovania ai_credits — žiadne nové automatické granty bez schválenia
type: constraint
---

# AI Credits — pravidlá pripisovania

## ZAKÁZANÉ bez explicitného súhlasu používateľa
- Žiadne nové migrácie, ktoré priamo INSERT/UPDATE `public.ai_credits` (alebo akýchkoľvek `*_credits` tabuliek) pre reálnych používateľov.
- Žiadne nové "welcome bonus", "free tier", "promo seed" funkcie.
- Žiadne hard-coded user ID granty (typ `20260527104220` migrácie — GREATEST(remaining, 200)).
- Žiadne edge funkcie, ktoré pridávajú kredity bez Stripe webhooku alebo schváleného flowu.

## SCHVÁLENÉ automatické zdroje (nemeniť bez súhlasu)
1. `monthly-credits-grant` cron — 1. dňa v mesiaci +10 kreditov (`0 2 1 * *`)
2. `claim_founding_member()` RPC — +50, capped na 100 členov
3. Promo kódy (`ai_credit_promo_codes`) — používateľský redeem
4. Referrals (`ai_credit_referrals`) — používateľský redeem
5. Gift kredity (`ai_credit_gifts`) — Stripe-platené
6. Auto-recharge (`ai_credits_auto_recharge`) — Stripe-platené
7. Stripe payment cez `create-checkout` → `verify-payment`

## Auditovanie
- Tabuľka `public.ai_credits_ledger` + trigger `trg_ai_credits_ledger` na `ai_credits` zaznamenáva každú zmenu `credits_remaining` (delta, before, after, reason, source, actor).
- Edge funkcie / RPC, ktoré menia kredity, MUSIA pred UPDATE nastaviť:
  ```sql
  SET LOCAL app.credit_reason = 'monthly_grant';
  SET LOCAL app.credit_source = 'cron';
  ```
  alebo cez Postgres `set_config('app.credit_reason', '...', true)`.
- Bez nastavenia sa zapíše `reason='unknown_update'` → admin tieto pravidelne reviewuje.

## Pravidlo pre AI agenta
Pred akoukoľvek zmenou `ai_credits` (migrácia, edge funkcia, RPC) **POVINNE** opýtať používateľa na explicitné schválenie a uviesť: kto, koľko, prečo, jednorazovo alebo opakovane.
