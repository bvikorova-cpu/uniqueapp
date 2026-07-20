## Verified + Tiered Subscription ("Unique Verified") na Unique

### Cieľ
Na Unique pridať overovací program s 3 tierami, zlatým trblietavým odznakom (nie modrá fajka) a reálnymi benefitmi — podobne ako Meta Verified, ale plne integrované do existujúcej predplatiteľskej infraštruktúry Unique.

### Tierová štruktúra

| Tier | Názov | Cena (EUR) | Typ | Zlatý odznak | Hlavné benefity |
|------|-------|------------|-----|--------------|-----------------|
| 1 | **Unique Verified** | 9,99 € jednorázovo | One-time | `verified` | Zlatý odznak na profile, priorita vo Wall feede, +50 AI kreditov, VIP support, overený profil proti falošným účtom |
| 2 | **Unique Plus** | 4,99 € / mesiac | Subscription | `plus` | Všetko z Verified + "Plus" odznak, +200 kreditov/mes., vynikajúca viditeľnosť, exkluzívne funkcie (napr. skryté náhľady, priority DM) |
| 3 | **Unique Pro** | 14,99 € / mesiac | Subscription | `pro` | Všetko z Plus + "Pro" odznak, neobmedzené AI kredity, top priorita vo feede, custom branding, osobný account manager |

### Čo sa postaví

#### 1. Databáza (migrácie)
- Rozšíriť `profiles` o `verification_tier` (`none`, `verified`, `plus`, `pro`) a `verification_expires_at` (pre subscription tiers).
- Ponechať existujúce `is_verified` ako `verification_tier != 'none'`.
- Rozšíriť enum `subscription_tier` o `verified` (one-time), `plus`, `pro`.
- Vytvoriť tabuľku `verification_benefits_log` pre audit uplatňovania benefitov (kredity, feed priority, atď.).
- GRANT + RLS policies na nové stĺpce/tabuľky.

#### 2. Stripe produkty a ceny
- Vytvoriť 3 Stripe products s price IDs:
  - `prod_unique_verified` (€9.99 one-time)
  - `prod_unique_plus` (€4.99 / mesiac)
  - `prod_unique_pro` (€14.99 / mesiac)
- Uložiť price IDs do edge-function config mapy.

#### 3. Edge functions
- Rozšíriť `create-checkout/index.ts` o routing pre `verified`, `plus`, `pro`.
- Rozšíriť `check-subscription/index.ts` o tieto 3 tiery.
- Vytvoriť novú edge function `verify-payment-callback` (alebo rozšíriť existujúcu), ktorá po úspešnej platbe aktualizuje `profiles.verification_tier` a pri subscription nastaví `verification_expires_at`.
- Pridať webhook handler, ktorý pri subscription cancellation/payment failure zníži tier na `none`/`verified` podľa typu.

#### 4. Frontend komponenty
- **VerifiedBadge**: zlatý trblietavý SVG odznak s 3 variantami (`verified`, `plus`, `pro`). Použijeť na profile, Wall posts, komentáre, Messenger.
- **VerificationPage**: nová stránka `/verified` s 3 tier cards, cenami, benefit listami, porovnávacou tabuľkou a tlačítkami na platbu.
- **SubscriptionBadge**: integrovať odznak do existujúcej Subscription stránky.
- **ProfileHeader update**: zobraziť zlatý odznak pri mene používateľa.
- **WallFeed priority**: upraviť feed query, aby priorizovala `plus`/`pro` a pridala zlatý odznak k postom overených používateľov.

#### 5. AuthContext / globálny stav
- Pridať `verificationTier` do `AuthContext`.
- Po prihlásení / session refresh načítať z `profiles` stĺpce `verification_tier`, `verification_expires_at`, `is_verified`.
- Exponovať helper `hasTier('verified' | 'plus' | 'pro')` pre UI a gating.

#### 6. Benefity — reálne funkcie
- **Extra kredity**: trigger po úspešnej platbe pripíše kredity do `ai_credits` (50/200/nestíhajúco).
- **Feed priority**: Wall feed query zoradí najprv `pro`, potom `plus`, potom `verified`, potom ostatní (vnútri časového rámca).
- **VIP support**: zobraziť prioritu pri podpore / otváraní support ticketu.
- **Exkluzívne funkcie**: gating pre „priority DM", „verified-only badge v profile", „custom profile theme color" (pro).
- **Anti-fake**: verified status sa dá stratiť pri závažnom porušení pravidiel (admin flag).

#### 7. Admin / bezpečnosť
- Admin panel: zoznam overených používateľov, možnosť odobrať odznak (manuálne + dôvod).
- RLS: používateľ môže čítať `verification_tier` všetkých profilov (public info), ale upravovať len vlastný (a to len cez edge function po overenej platbe).
- Rate limiting na checkout volania.

### Design
- Svetlý režim (podľa memory: default light mode).
- Zlatá gradientová paleta: `#fbbf24` → `#f59e0b` → `#d97706`.
- Trblietavý efekt cez CSS keyframe shimmer (pre SVG badge, nie CSS animácie na kritických cestách).
- Čisté, elegantné karty podobné obrázku — ale Unique branding, nie Meta kópia.

### Testovanie
- Playwright E2E: zobrazenie `/verified`, checkout redirect, zobrazenie odznaku po návrate.
- Unit test pre `hasTier` helper.
- Edge function test pre checkout routing a tier aktualizáciu.

### Nezaradené do rozsahu
- Žiadne fyzické produkty, iba digitálne overenie/subscription.
- Neprepisujeme existujúce `basic`/`premium`/`business` subscription tiers — tieto 3 nové tiery fungujú paralelne a dopĺňajú ich.

### Odhadovaná veľkosť
Stredne veľká feature: 8-10 nových/súvisiacich súborov, 2-3 migrácie, 2 edge function updaty, 5-6 frontend komponentov. Potrebná je Stripe konfigurácia produktov.