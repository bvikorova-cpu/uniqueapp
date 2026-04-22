---
name: Multi-currency support
description: Global CurrencyProvider + GlobalCurrencySwitcher in Navbar. EUR is base; useCurrency() / format() everywhere.
type: feature
---
**Context**: `src/contexts/CurrencyContext.tsx` exposes `CurrencyProvider`, `useCurrency()`, `formatPrice()`, `CURRENCIES`.
- 9 currencies: EUR (base), USD, GBP, CHF, PLN, CZK, INR, BRL, JPY. Static rates vs EUR.
- Auto-detects from `navigator.language` region; persists in `localStorage["global-currency"]` (legacy `subscription-currency` is honored on first load).

**UI**: `<GlobalCurrencySwitcher />` mounted in Navbar (desktop, beside NotificationBell). Subscription page still uses `useDetectedCurrency()` which now reads/writes the same global context — switching anywhere updates everywhere.

**Usage in components**:
```tsx
const { format } = useCurrency();
return <span>{format(9.99)}</span>; // EUR price -> rendered in user's currency
```

**Important**: Stripe checkout still charges in EUR. Currency switcher is display-only (FX hint), not a billing currency change.
