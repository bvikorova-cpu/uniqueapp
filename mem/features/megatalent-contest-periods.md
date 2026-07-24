---
name: Megatalent Contest Periods
description: Quarterly contest schedule. Prize pool = 50% of platform's net profit from Megatalent subscriptions (no minimum guarantee). Live counter.
type: feature
---

## Schedule (quarterly)

- **Q3 2026:** 1.7.2026 – 30.9.2026
- **Q4 2026:** 1.10.2026 – 31.12.2026
- Future quarters: insert via admin panel or SQL into `mt_contest_settings`.

## Prize pool formula

```
prize_pool = max(min_prize_pool_eur, accumulated_platform_eur × revenue_share_pct / 100)
```

- `revenue_share_pct` default: **50 %**
- `min_prize_pool_eur` default: **€5,000** (guaranteed floor)
- `accumulated_platform_eur` grows LIVE — stripe-webhook calls `public.mt_add_platform_share(_amount_eur)` on each paid Megatalent invoice with the platform's share (€5 for Premium, €10 for TOP Premium; referral €5 is NOT counted).

## Table: `public.mt_contest_settings`

- `period_start` / `period_end` (date) — UNIQUE pair
- `revenue_share_pct` (numeric, default 50)
- `min_prize_pool_eur` (numeric, default 5000)
- `accumulated_platform_eur` (numeric, default 0) — updated by webhook
- `prize_pool_eur` (numeric, legacy fixed value — used only as fallback if no active period)
- `title` (text)
- RLS: anyone reads; only admins write.

## UI hook

- `useMegatalentContestStats` (`src/hooks/useMegatalentContestStats.ts`) reads the active/next period and computes the live prize pool using the formula above.
- `prizePoolFormatted` is shown in MegaTalentHero, ContestStatsSidebar, MegatalentEngagementRow.

## Adding a new period

```sql
INSERT INTO public.mt_contest_settings
  (period_start, period_end, revenue_share_pct, min_prize_pool_eur, title)
VALUES ('2027-01-01','2027-03-31', 50, 5000, 'Q1 2027 Megatalent Contest');
```
