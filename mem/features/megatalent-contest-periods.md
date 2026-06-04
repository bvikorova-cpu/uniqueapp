---
name: Megatalent Contest Periods
description: Quarterly contest schedule with fixed €10,000 prize pool. Configured via mt_contest_settings table; admin-editable.
type: feature
---

## Schedule (quarterly)

- **Q3 2026:** 1.7.2026 – 30.9.2026 — €10,000
- **Q4 2026:** 1.10.2026 – 31.12.2026 — €10,000
- Future quarters: insert via admin panel or SQL into `mt_contest_settings`.

## Table: `public.mt_contest_settings`

- `period_start` (date), `period_end` (date) — UNIQUE pair
- `prize_pool_eur` (numeric, default 10000)
- `title` (text)
- RLS: anyone reads; only admins write.

## UI hook

- `useMegatalentContestStats` (`src/hooks/useMegatalentContestStats.ts`) reads the currently active period (today between `period_start` and `period_end`), or falls back to the next upcoming period, or to €10,000 default.
- `prizePoolFormatted` is the value shown in MegaTalentHero, ContestStatsSidebar, MegatalentEngagementRow.

## Adding a new period

```sql
INSERT INTO public.mt_contest_settings (period_start, period_end, prize_pool_eur, title)
VALUES ('2027-01-01','2027-03-31',10000,'Q1 2027 Megatalent Contest');
```
