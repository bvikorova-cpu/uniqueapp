---
name: Referral Fraud Detection
description: Anti-abuse scoring for referral attributions. Phase 9i — self-referral, IP/device collision, disposable email, velocity rules.
type: feature
---

## Score model

`claim-referral` edge fn computes a fraud_score (0-100) at attribution time:

| Signal | Points | Severity |
|---|---|---|
| `self_referral` (same user_id) | 100 → instant **blocked** | high |
| `disposable_email` (mailinator, guerrillamail, 10minutemail, …) | +50 | high |
| `shared_ip_with_referrer` (profiles.signup_ip match) | +60 | high |
| `ip_velocity` (same signup_ip used by ≥3 signups in 24h) | +40 | medium |
| `referrer_velocity` (referrer claimed ≥5 rewards in 24h) | +30 | medium |

Final status:
- `score >= 70` → **`blocked`** (no reward, ever)
- `score 40-69` → **`flagged`** (held for admin review)
- `score < 40` → **`approved`** (auto-rewarded by `stripe-webhook` on first sub)

Each signal also writes a row to `referral_fraud_flags` for audit.

## Tables

- **`profiles.signup_ip` + `signup_user_agent`** — captured by `claim-referral` from `x-forwarded-for` / `cf-connecting-ip` / `x-real-ip` and persisted only if currently null.
- **`referral_attributions.fraud_score / status / fraud_reasons`** — `status` gates the webhook reward.
- **`referral_fraud_flags`** — admin-only RLS, one row per triggered signal.

## Webhook gate

`stripe-webhook` `customer.subscription.created/updated` only credits €5 when `referral_attributions.status = 'approved'`.

## Admin UI

`/admin/referral-fraud` — tabs for `Flagged` / `Blocked` / `Approved` with one-click Approve/Block actions that update `referral_attributions.status`.
