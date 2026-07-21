# Complete Unique VIP Club — end-to-end

Cieľ: každý kúsok Klubu, ktorý sľubuje karta, musí byť naozaj funkčný po zaplatení. Žiadne "coming soon".

## 1. Fyzická karta — kam a komu poslať

Aktuálne Stripe Checkout zbiera len adresu. Doplníme:

- **`create-club-checkout`**: pridať `phone_number_collection.enabled = true`, `custom_fields` pre "Recipient name" (ak sa má poslať niekomu inému) + note pre kuriéra.
- **`verify-club-membership`**: uložiť do `club_memberships.shipping_address` už rozšírený objekt (name, phone, note, address).
- Nový edge fn **`update-club-shipping`**: umožniť členovi upraviť adresu/telefón kým je `shipping_status = 'pending'` (RLS-checked).
- **UI**: na `/club/card` a v `ClubMembershipCard` (profil) pridať sekciu „Shipping" pre fyzických členov — zobraziť adresu, tel, status; „Edit shipping" dialog volá `update-club-shipping`.
- Ak niekto omylom nevyplnil adresu pri Stripe (edge case), UI to detekuje a vyžiada doplnenie.

## 2. Admin shipping queue

- Nová stránka **`/admin/club/shipping`** (chránená `has_role('admin')`): tabuľka pending fyzických kariet — meno, tel, adresa, member #, dátum, akcie: „Mark shipped", „Mark delivered", CSV export pre tlačiareň.
- Edge fn **`admin-update-club-shipping-status`** pre bezpečnú zmenu statusu.

## 3. Perky sa musia zapnúť po platbe

### 3a. +50 AI kreditov mesačne
- Rozšíriť **`stripe-webhook`** o handler pre Club subscription:
  - `invoice.paid` (product == unique_club) → predĺžiť `current_period_end`, `INSERT` €0.15 do `club_good_fund_ledger` (source='monthly'), pripísať **+50 AI credits** cez existujúci ledger (`ai_credits_ledger`) + notifikácia.
  - `customer.subscription.deleted` / `unpaid` → `status='canceled'/'past_due'`.
- **`verify-club-membership`**: hneď pri sign-up prideliť prvých **+50 AI kreditov** (nie čakať mesiac).

### 3b. Automatická -15% zľava všade
- Vytvoriť Stripe coupon **`UNIQUE_CLUB_15`** (percent_off=15, forever) a uložiť ID do secret `STRIPE_CLUB_COUPON_ID`.
- Nový shared helper **`apply-club-discount`** (deno modul importovaný z ostatných checkoutov): vezme user_id → ak aktívny club member vráti `discounts: [{ coupon: STRIPE_CLUB_COUPON_ID }]`.
- Wire do najviac používaných checkoutov: `create-ai-credits-checkout`, `create-verified-checkout`, `fanclub-checkout`, `create-bazaar-checkout`, `create-course-checkout`, `create-concert-ticket`, `create-ppv-checkout`, `create-gift-checkout`. Ostatné (menej frekventované) sa dopnú neskôr — každý invoke helperu je 1 riadok.

### 3c. Zlatý ring, founding badge, member #
- Už hotové (`MemberBadge`, DB trigger pre `is_founding`, `member_number` sekvencia).

### 3d. Refer-a-friend €5
- Aktuálne `verify-club-membership` uloží referral, ale credit sa nikde neminie. Doplniť:
  - `club_referrals.credit_awarded_eur` → prepočítať na Stripe customer balance (`stripe.customers.createBalanceTransaction`, amount negatívny = credit) pre referrera. Ak nemá customer, uložiť pending a aplikovať pri prvom checkoute.
  - UI kartička „Your referral link" na `/club` s copy tlačidlom (link `?ref=<membership_id>`).

### 3e. Priority access + monthly member drop
- Zaviesť flag **`club_only_until: timestamptz`** na `feature_flags` — existujúci `useFeatureFlag` už môže vracať `enabled_for_club_only`. Rozšírime hook o `isClubMember` check. Prvý „monthly drop" (extra wheel spin) sa aktivuje jednoducho ako flag.

## 4. Homepage banner + push
- **`ClubHomepageBanner`** už existuje; overiť že sa zobrazuje non-členom (dismissible localStorage).
- Push: použiť existujúci `send-push-notification` s cieľom „all non-members" — jednorazovo cez admin tool (mimo tejto úlohy).

## 5. DB migrácia

- `alter table club_memberships add column phone text, add column recipient_name text, add column shipping_note text;`
- `create table club_perk_grants(user_id, perk, granted_at, period_start, period_end)` — audit že sme 50 kreditov naozaj pripísali za dané obdobie (idempotencia proti webhook duplicitám).
- Rozšíriť `has_role('admin')` policy pre `club_memberships` update (shipping status).

## 6. Súbory (nové/upravené)

**Backend**
- `supabase/functions/create-club-checkout/index.ts` — phone + custom fields
- `supabase/functions/verify-club-membership/index.ts` — persist rozšírené shipping + first 50 credits + welcome notification
- `supabase/functions/update-club-shipping/index.ts` — NEW
- `supabase/functions/admin-update-club-shipping-status/index.ts` — NEW
- `supabase/functions/stripe-webhook/index.ts` — Club invoice.paid / subscription.deleted vetvy
- `supabase/functions/_shared/apply-club-discount.ts` — NEW helper
- Wiring v: `create-ai-credits-checkout`, `create-verified-checkout`, `fanclub-checkout`, `create-bazaar-checkout`, `create-course-checkout`, `create-concert-ticket`, `create-ppv-checkout`, `create-gift-checkout`

**Frontend**
- `src/pages/ClubCard.tsx` — Shipping panel + Edit dialog
- `src/components/profile/ClubMembershipCard.tsx` — shipping status chip
- `src/pages/Club.tsx` — referral link card
- `src/components/club/EditShippingDialog.tsx` — NEW
- `src/pages/admin/AdminClubShipping.tsx` — NEW
- Route pridať v `src/App.tsx` (lazy)

**DB**
- Jedna migrácia (kolóny + audit tabuľka + GRANTs + RLS + admin policy).

## 7. Out of scope

- Skutočná integrácia s tlačiarňou / Printful (admin queue + CSV export je handoff).
- Apple/Google Wallet .pkpass (Apple cert chýba).
- Kompletné wire discountu do všetkých ~40 checkout funkcií — 8 top použitých teraz, zvyšok postupne.

Po odsúhlasení idem stavať.
