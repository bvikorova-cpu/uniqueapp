---
name: Security Scan
description: Automated security scan for edge functions (static + runtime audit) and frontend npm dependencies (OSV.dev CVE check). Admin UI at /admin/security-scan.
type: feature
---

## Edge functions

- `security-scan-edge-functions` (`verify_jwt=false`) — admin JWT or `body.source==='cron'` required.
  - Static heuristics over each function's source (fetched from GitHub if `GITHUB_REPO_OWNER/NAME/TOKEN` set):
    service_role leak in response, hardcoded secrets (Stripe/Google/JWT), missing CORS preflight/headers,
    raw `execute_sql` RPC, weak `auth.getUser()` validation, missing input validation, wildcard CORS+credentials.
  - Runtime probe: OPTIONS request to a curated list (stripe-webhook, create-checkout, verify-payment,
    check-sca, claim-referral, admin-refund-payment, admin-payout-withdrawal) — flags 5xx and missing CORS.

- `security-scan-frontend-deps` (`verify_jwt=false`) — same auth.
  - Reads `package.json` from GitHub or `body.manifest`.
  - Calls `https://api.osv.dev/v1/querybatch` then `vulns/{id}` for details. No API key needed.
  - Severity mapped from CVSS (≥9 critical, ≥7 high, ≥4 medium, else low).

## Storage

`security_scan_snapshots` table — admin-only RLS (`has_role(auth.uid(),'admin')`). Stores counts per
severity, full findings JSON, meta (functions/packages scanned), duration_ms, trigger_source.

## Cron

pg_cron daily:
- `daily-security-scan-edge` 03:30 UTC → POST `security-scan-edge-functions` with `{source:'cron'}`
- `daily-security-scan-deps` 03:35 UTC → same for deps fn

## Admin UI

`/admin/security-scan` — two tabs (Edge Functions, Dependencies). Each shows latest counts,
sorted findings, and collapsible history (last 10). Banner if any critical findings.

## Optional secrets

Set in Supabase secrets to enable source-code static analysis (otherwise only runtime probe runs):
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_TOKEN` (read-only, contents:read scope)
