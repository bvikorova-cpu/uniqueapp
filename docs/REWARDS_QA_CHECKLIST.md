# Rewards QA Checklist — Nathalie

> Manual click-through for the Rewards section. Tick each box after verifying in the live preview.
> If any step fails, copy the error from console + network tab into the "Notes" cell and notify the dev team.

**Tester:** Nathalie  
**Build:** _(paste build SHA from footer)_  
**Date:** _____________

---

## 1. Entry & Overview (`/rewards`)

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 1.1 | Open `/rewards` while logged in | Page renders, no JS errors in console | ☐ | |
| 1.2 | Hero shows real level, XP, streak, badges count | Numbers match `user_points` row | ☐ | |
| 1.3 | All tabs visible: Lucky Wheel, XP Bets, Quest Path, Battle Pass, Calendar, Marketplace | All clickable, no 404 | ☐ | |
| 1.4 | Logout, reload `/rewards` | Redirect to `/auth` (no data leak) | ☐ | |

## 2. Lucky Wheel

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 2.1 | Click "Spin" once | Animation runs, toast shows prize, XP updates | ☐ | |
| 2.2 | Try to spin again immediately | Blocked (cooldown / daily-limit toast) | ☐ | |
| 2.3 | Check `lucky_spin_log` in admin Rewards Audit | New row with correct prize | ☐ | |

## 3. XP Bets

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 3.1 | Place a 10 XP bet on any challenge | XP balance drops by 10, bet appears "active" | ☐ | |
| 3.2 | Try to place same bet twice rapidly | Second click ignored or errors cleanly (no double-charge) | ☐ | |
| 3.3 | Place bet with more XP than balance | Blocked with clear error | ☐ | |
| 3.4 | Wait until `ends_at` passes, refresh | Status moves to `won`/`lost`, payout applied | ☐ | |

## 4. Quest Path

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 4.1 | First unlocked node visible, locked nodes greyed | Lock icon on locked | ☐ | |
| 4.2 | Claim first node | XP awarded, next node unlocks | ☐ | |
| 4.3 | Try to claim same node twice | Second click rejects with `already_claimed` | ☐ | |

## 5. Battle Pass

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 5.1 | Free track tier shows claim button when reached | Click awards XP | ☐ | |
| 5.2 | Premium tier shows lock / upgrade CTA when not premium | No claim possible | ☐ | |

## 6. Calendar

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 6.1 | Today's day claimable | Claim works once | ☐ | |
| 6.2 | Yesterday/future days not claimable | UI blocks click | ☐ | |

## 7. Marketplace

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 7.1 | Items load with cost in XP | Match `shop_items` | ☐ | |
| 7.2 | Buy affordable item | "Owned ×N" appears, XP drops | ☐ | |
| 7.3 | Buy item you can't afford | Error toast `insufficient_xp` | ☐ | |

## 8. Weekly Leaderboard

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 8.1 | Watch rewarded ad → +5 XP toast | Within 1s | ☐ | |
| 8.2 | Try second view within 30s | 429 / cooldown toast | ☐ | |
| 8.3 | "Your position" card visible even outside top 10 | Shows rank or "unranked" | ☐ | |

## 9. Admin sanity (admin login required)

| # | Action | Expected | OK | Notes |
|---|--------|----------|----|-------|
| 9.1 | Open `/admin/rewards-audit` | Loads stats + 3 tables | ☐ | |
| 9.2 | "Stuck bets" KPI = 0 | If >0 → file a ticket | ☐ | |
| 9.3 | "Fraud flags 7d" reviewed | All known-good users? | ☐ | |
| 9.4 | Export each CSV | Downloads with rows | ☐ | |

---

**Sign-off:** ☐ All critical paths green → Nathalie ___________ Date __________
