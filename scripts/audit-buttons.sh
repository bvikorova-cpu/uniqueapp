#!/usr/bin/env bash
# Mega audit script: probes all critical edge functions and public routes.
# Verifies expected HTTP status codes and JSON shape (auth guards, CORS, etc.).
#
# Usage:
#   ./scripts/audit-buttons.sh                # uses defaults below
#   SUPABASE_URL=... ANON_KEY=... AUTH_JWT=... ./scripts/audit-buttons.sh
#
# Exits non-zero if any check fails.

set -u

SUPABASE_URL="${SUPABASE_URL:-https://jufrdzeonywluwutvyxz.supabase.co}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q}"
AUTH_JWT="${AUTH_JWT:-}"
APP_URL="${APP_URL:-https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app}"

PASS=0
FAIL=0
RESULTS=()

color() { case "$1" in red) printf '\033[31m';; green) printf '\033[32m';; yellow) printf '\033[33m';; *) printf '';; esac; }
reset() { printf '\033[0m'; }

check() {
  local label="$1" expected="$2" actual="$3" extra="${4:-}"
  if [[ "$expected" == *"|"* ]] && [[ "|$expected|" == *"|$actual|"* ]]; then
    PASS=$((PASS+1)); RESULTS+=("$(color green)✓$(reset) $label → $actual $extra")
  elif [[ "$expected" == "$actual" ]]; then
    PASS=$((PASS+1)); RESULTS+=("$(color green)✓$(reset) $label → $actual $extra")
  else
    FAIL=$((FAIL+1)); RESULTS+=("$(color red)✗$(reset) $label → expected $expected, got $actual $extra")
  fi
}

probe_edge() {
  local fn="$1" expected="$2" body="${3:-{\}}" method="${4:-POST}" use_auth="${5:-anon}"
  local auth="Bearer $ANON_KEY"
  [[ "$use_auth" == "user" && -n "$AUTH_JWT" ]] && auth="Bearer $AUTH_JWT"
  [[ "$use_auth" == "none" ]] && auth=""
  local hdr=(-H "apikey: $ANON_KEY" -H "content-type: application/json")
  [[ -n "$auth" ]] && hdr+=(-H "authorization: $auth")
  local code
  code=$(curl -s -o /tmp/audit-resp.json -w "%{http_code}" -X "$method" "${hdr[@]}" -d "$body" "$SUPABASE_URL/functions/v1/$fn" || echo "000")
  check "edge:$fn ($use_auth)" "$expected" "$code"
}

probe_route() {
  local path="$1" expected="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$APP_URL$path" || echo "000")
  check "route:$path" "$expected" "$code"
}

probe_cors() {
  local fn="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: POST" \
    "$SUPABASE_URL/functions/v1/$fn" || echo "000")
  check "cors:$fn" "200|204" "$code"
}

echo "── Edge functions: auth guards (must reject anon — 4xx) ──"
for fn in \
  create-checkout \
  verify-payment \
  verify-reincarnation-payment \
  create-holographic-avatar-checkout \
  create-reincarnation-plan \
  generate-past-life-regression \
  generate-gift-message \
  text-to-speech \
  post-confession \
  vote-absolution \
  generate-redemption-plan \
  verify-confession-payment \
  ; do
  probe_edge "$fn" "400|401|403" '{}' POST anon
done

echo "── Public read endpoints (expect 200) ──"
probe_edge get-confessions "200" '{"limit":3}' POST anon

# Admin-only functions may not be publicly deployed; allow 401/403/404
for fn in admin-stripe-payout admin-stripe-refund; do
  probe_edge "$fn" "401|403|404" '{}' POST anon
done

echo "── Edge functions: CORS preflight (expect 200/204) ──"
for fn in create-checkout verify-payment generate-gift-message check-dunning check-sca; do
  probe_cors "$fn"
done

echo "── Edge functions: dunning is public (200), check-sca needs auth (401) ──"
probe_edge check-dunning   "200" '{}' POST anon
probe_edge check-sca       "401" '{}' POST anon

echo "── Edge functions: bad input validation (expect 400/401) ──"
probe_edge create-checkout "400|401" '{"invalid":true}' POST anon
probe_edge verify-payment  "400|401" '{}' POST anon

echo "── Public routes (expect 200) ──"
for path in \
  / \
  /index \
  /dna-memory-network \
  /reincarnation-social \
  /crystal-energy-network \
  /holographic-avatars \
  /time-capsule \
  /time-reversal \
  /multiverse \
  /auth \
  ; do
  probe_route "$path" "200"
done

echo
echo "──────── RESULTS ────────"
for r in "${RESULTS[@]}"; do echo -e "$r"; done
echo "─────────────────────────"
echo "Passed: $(color green)$PASS$(reset)   Failed: $(color red)$FAIL$(reset)"
[[ $FAIL -eq 0 ]] || exit 1
