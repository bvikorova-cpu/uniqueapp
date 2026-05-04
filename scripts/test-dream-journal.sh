#!/usr/bin/env bash
# Automated curl test for /dream-journal
# Verifies: route reachability, RLS lockdown, edge function auth/credit guards.
#
# Usage:
#   bash scripts/test-dream-journal.sh
#   ACCESS_TOKEN=eyJ... bash scripts/test-dream-journal.sh   # to also test auth'd flows

set -uo pipefail

SUPABASE_URL="${SUPABASE_URL:-https://jufrdzeonywluwutvyxz.supabase.co}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q}"
APP_URL="${APP_URL:-https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"

PASS=0; FAIL=0
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
yel()   { printf "\033[33m%s\033[0m\n" "$*"; }

# expect_status NAME EXPECTED ACTUAL
expect_status() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    green "✓ $name → $actual"
    PASS=$((PASS+1))
  else
    red   "✗ $name → expected $expected, got $actual"
    FAIL=$((FAIL+1))
  fi
}

# expect_status_in NAME ACTUAL EXPECTED...
expect_status_in() {
  local name="$1"; shift
  local actual="$1"; shift
  for code in "$@"; do
    if [[ "$actual" == "$code" ]]; then
      green "✓ $name → $actual"
      PASS=$((PASS+1)); return
    fi
  done
  red "✗ $name → got $actual, expected one of: $*"
  FAIL=$((FAIL+1))
}

call_fn() {
  local fn="$1" body="${2:-{}}" auth="${3:-anon}"
  local hdr="Bearer $ANON_KEY"
  [[ "$auth" == "user" && -n "$ACCESS_TOKEN" ]] && hdr="Bearer $ACCESS_TOKEN"
  curl -s -o /tmp/_dj_body.json -w "%{http_code}" \
    -X POST "$SUPABASE_URL/functions/v1/$fn" \
    -H "Content-Type: application/json" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: $hdr" \
    -d "$body"
}

rest_get() {
  local table="$1" auth="${2:-anon}"
  local hdr="Bearer $ANON_KEY"
  [[ "$auth" == "user" && -n "$ACCESS_TOKEN" ]] && hdr="Bearer $ACCESS_TOKEN"
  curl -s -o /tmp/_dj_rest.json -w "%{http_code}" \
    "$SUPABASE_URL/rest/v1/$table?select=*&limit=1" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: $hdr"
}

echo "════════════════════════════════════════════════"
echo " /dream-journal — automated megatest"
echo "════════════════════════════════════════════════"
echo "App: $APP_URL"
echo "Supabase: $SUPABASE_URL"
echo "Auth mode: $([[ -n "$ACCESS_TOKEN" ]] && echo authenticated || echo anonymous)"
echo ""

# ─────────────────────────────────────────────────
yel "▸ 1. Route & SPA reachability"
# ─────────────────────────────────────────────────
code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/dream-journal")
expect_status_in "GET /dream-journal" "$code" 200 304 302

code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/ai-credits-store")
expect_status_in "GET /ai-credits-store (Buy Credits redirect target)" "$code" 200 304 302

# ─────────────────────────────────────────────────
yel "▸ 2. RLS lockdown — anonymous reads must be blocked"
# ─────────────────────────────────────────────────
for tbl in dream_entries journal_entries mood_logs dream_mood_entries ai_credits; do
  code=$(rest_get "$tbl" anon)
  # 200 with [] is acceptable (RLS returns empty), 401/403 also acceptable
  if [[ "$code" == "200" ]]; then
    body=$(cat /tmp/_dj_rest.json)
    if [[ "$body" == "[]" ]]; then
      green "✓ RLS $tbl (anon) → 200 [] (empty under RLS)"
      PASS=$((PASS+1))
    else
      red "✗ RLS $tbl (anon) → 200 with data leak: $body"
      FAIL=$((FAIL+1))
    fi
  else
    expect_status_in "RLS $tbl (anon)" "$code" 401 403
  fi
done

# ─────────────────────────────────────────────────
yel "▸ 3. Edge functions — auth guards (anonymous must be 401)"
# ─────────────────────────────────────────────────
# Call without Authorization header at all
for fn in dream-ai analyze-dream analyze-journal; do
  code=$(curl -s -o /tmp/_dj_body.json -w "%{http_code}" \
    -X POST "$SUPABASE_URL/functions/v1/$fn" \
    -H "Content-Type: application/json" \
    -H "apikey: $ANON_KEY" \
    -d '{}')
  expect_status_in "POST $fn (no auth)" "$code" 401
done

# ─────────────────────────────────────────────────
yel "▸ 4. Edge functions — CORS preflight"
# ─────────────────────────────────────────────────
for fn in dream-ai analyze-dream analyze-journal; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS "$SUPABASE_URL/functions/v1/$fn" \
    -H "Origin: $APP_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type")
  expect_status_in "OPTIONS $fn (CORS preflight)" "$code" 200 204
done

# ─────────────────────────────────────────────────
yel "▸ 5. Edge functions — bad payload handling (with anon JWT)"
# ─────────────────────────────────────────────────
# anon JWT is technically a valid JWT but not a user → expect 401 (no user)
code=$(call_fn "dream-ai" '{"action":"lucid-coach","experience":"beginner","goal":"x"}' anon)
expect_status_in "POST dream-ai (anon JWT, no user)" "$code" 401 403

code=$(call_fn "analyze-dream" '{"dreamContent":"flying"}' anon)
expect_status_in "POST analyze-dream (anon JWT, no user)" "$code" 401 403

code=$(call_fn "analyze-journal" '{"journalContent":"today","mood":"good"}' anon)
expect_status_in "POST analyze-journal (anon JWT, no user)" "$code" 401 403

# ─────────────────────────────────────────────────
yel "▸ 6. Authenticated user-flow tests (only with ACCESS_TOKEN)"
# ─────────────────────────────────────────────────
if [[ -z "$ACCESS_TOKEN" ]]; then
  yel "  (skipped — set ACCESS_TOKEN=... to run)"
else
  # 6a. RLS reads with auth — must be 200
  for tbl in dream_entries journal_entries ai_credits; do
    code=$(rest_get "$tbl" user)
    expect_status_in "RLS $tbl (auth user)" "$code" 200
  done

  # 6b. dream-ai actions — each costs credits; expect 200 OR 402 (insufficient)
  for action in dictionary lucid-coach pattern-analysis sleep-analyzer sleep-ritual; do
    code=$(call_fn "dream-ai" "{\"action\":\"$action\",\"goal\":\"test\",\"experience\":\"beginner\"}" user)
    expect_status_in "dream-ai action=$action" "$code" 200 402
  done

  # 6c. analyze-dream / analyze-journal full flows
  code=$(call_fn "analyze-dream" '{"dreamContent":"I was flying over a city of glass towers"}' user)
  expect_status_in "analyze-dream (auth)" "$code" 200 402

  code=$(call_fn "analyze-journal" '{"journalContent":"Productive day, finished the report.","mood":"good"}' user)
  expect_status_in "analyze-journal (auth)" "$code" 200 402

  # 6d. Missing required fields → must NOT 500
  code=$(call_fn "analyze-dream" '{}' user)
  expect_status_in "analyze-dream (missing field)" "$code" 400 422 402
fi

# ─────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo " RESULT: $PASS passed, $FAIL failed"
echo "════════════════════════════════════════════════"
[[ "$FAIL" -eq 0 ]] || exit 1
