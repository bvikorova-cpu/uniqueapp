---
name: No ad-network service worker / push
description: Never import Monetag (5gvci.com) or any ad network SW into public/sw.js — it sent "Install VPN" spam notifications
type: constraint
---

`public/sw.js` must contain ONLY our own Web Push logic. Do not `importScripts` any
ad network service worker (Monetag `https://5gvci.com/act/files/service-worker.min.js`,
or similar), and do not set `self.options`/`self.lary` ad config there.

**Why:** users received unsolicited ad push notifications on mobile (e.g. "Install VPN"),
even inside the installed PWA.

The push handler also drops any payload that is not our own JSON (must contain
`title` or `kind`), so foreign pushes never render a notification.

Monetag display/rewarded ads via `src/lib/monetag.ts` (nap5k.com tag) are fine — only
push/SW-based ad formats are banned.
