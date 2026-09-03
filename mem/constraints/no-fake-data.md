---
name: No fake or mock data anywhere
description: Every user-facing number, list, name and stat must come from real DB/API data — never mock, random, demo or hardcoded placeholder values
type: constraint
---

Absolutely forbidden anywhere in the platform (UI, dashboards, leaderboards, stats, feeds, AI outputs, admin panels):
- mock/demo/sample/seed arrays rendered to users
- `Math.random()` for counts, prices, scores, views, ratings, earnings, followers
- hardcoded placeholder stats ("1.2k views", "60+ sections", fake percentages)
- invented names ("User", "Anonymous", "Coffee Lover", "Player 1") instead of real profile names
- estimated/simulated values presented as facts

Required instead:
- query the real table/RPC; show 0, "—" or an empty state when there is no data
- when a value cannot be computed, hide the widget rather than fake it
- verify in the DB before claiming a number is correct

**Why:** Unique must be trustworthy; fake data destroys user trust and breaks payouts/credits accounting.
