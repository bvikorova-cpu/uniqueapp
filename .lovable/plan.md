# Plán: Kvalita, bezpečnosť a konverzie

Zoradené podľa hodnoty pre používateľa a nezávislosti (dá sa robiť paralelne v tomto poradí):

## 1) 404 / route errors report

**Cieľ:** vedieť, kam v produkcii chodia ľudia a nenachádzajú stránku.

- Nová tabuľka `public.route_404_events` (path, referrer, user_id nullable, user_agent, occurred_at, redirected_to nullable).
- RLS: `INSERT` pre `anon` + `authenticated`, `SELECT` iba pre admina (`has_role(auth.uid(),'admin')`). GRANT-y podľa pravidiel.
- `NotFound.tsx` po detekcii nezhody spraví jeden `insert` (aj pri redirecte cez alias — uložíme aj `redirected_to`, nech vidíme čo bol legitímny redirect a čo skutočný miss).
- Throttling: dedupe cez `sessionStorage` (rovnaká cesta v rámci session sa nezapíše 2x).
- Nová admin stránka `/admin/route-errors` (chránená `AdminRoute`):
  - Top 50 chýbajúcich ciest za 7 / 30 dní (počet, unikátni používatelia, posledný výskyt, top referrer).
  - Tlačidlo „Add alias" → pri redirecte to iba otvorí `PREMIUM_ALIASES` mapu v `NotFound.tsx` s návodom (bez auto-editu).
  - Export CSV.

## 2) Button audit

**Cieľ:** žiadny `<Button>` v UI, ktorý po kliku nič nespraví.

- Script `scripts/audit-buttons.mjs`: AST-lite regex sken `src/**/*.tsx` — nájde `<Button ...>` bez `onClick`, `asChild`, `type="submit"`, `form=`, alebo bez toho, aby bol vnútri `<DialogTrigger>`, `<PopoverTrigger>`, `<DropdownMenuTrigger>`, `<SheetTrigger>`, `<TooltipTrigger>`, `<AlertDialogTrigger>`, `<Link>`.
- Report do konzoly + `docs/BUTTON_AUDIT.md` (path:line, kontext).
- Prejdem výsledok manuálne, opravím reálne mŕtve tlačidlá (očakávam ~15–25 skutočných hitov z ~80 kandidátov).
- Pridám script do `package.json` ako `audit:buttons`.

## 3) Odstránenie `any` v Stripe / auth ceste

**Cieľ:** znížiť riziko skrytých chýb v peniazoch a prihlásení.

Zúžený scope (nie celý codebase — iba kritické cesty):

- `src/contexts/AuthContext.tsx` — nahradiť `(data as any)` presnými typmi profilu (`Pick<Tables<'profiles'>, 'verification_tier'|'verification_expires_at'>`).
- `src/hooks/useClubMembership.ts`, `src/pages/Club.tsx`, `src/pages/ClubCard.tsx`, `src/pages/ClubCheckout.tsx`, `src/components/profile/ClubMembershipCard.tsx`, `src/components/profile/BillingOverviewCard.tsx`, `src/pages/Subscriptions.tsx`.
- `src/utils/createSaleTransaction.ts` a `src/lib/handleEdgeError.ts` ak obsahujú `any`.
- Nový `src/types/club.ts` s `ClubMembership`, `ClubShippingAddress`, `BillingInvoice`, `SubscriptionSummary`.
- Edge functions ostávajú (Deno, iný scope) — poznamenám do follow-upu.

Nesťahujem do toho `unknown` masaker — len tam, kde to reálne pomôže type-checkeru.

## 4) Google OAuth + magic-link login

**Cieľ:** menej trenia pri registrácii.

- Do `src/pages/Auth.tsx` (alebo existujúceho auth komponentu — najprv overím):
  - „Continue with Google" tlačidlo → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/' } })`.
  - „Email me a magic link" prepínač → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: … } })`.
- Google provider musí povoliť **užívateľ** v Supabase dashboarde (Auth → Providers → Google) s Client ID / Secret z Google Cloud — dám mu presné kroky v odpovedi. Bez toho tlačidlo bude vracať „provider is not enabled".
- Magic link funguje ihneď (default email provider už beží cez managed Lovable auth email).
- Site URL + redirect URL v Supabase Auth musia obsahovať `https://uniqueapp.fun` a `https://uniqueapp.lovable.app` — pripomeniem.

## Poradie doručenia

1. Task 1 (migrácia + NotFound insert + admin stránka) — samostatné.
2. Task 4 (OAuth + magic link UI) — samostatné, hneď viditeľné pre používateľov.
3. Task 2 (audit script + oprava reálnych mŕtvych buttonov).
4. Task 3 (typy) — najmenej viditeľné, ale najbezpečnejšie na konci, keď máme čistý strom.

Po schválení idem robiť v tomto poradí, každý task doručím a poviem ti čo je hotové.
