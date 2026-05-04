#!/usr/bin/env bash
# Automated curl test for /fashion-studio
# Usage:
#   bash scripts/test-fashion-studio.sh
#   ACCESS_TOKEN=eyJ... bash scripts/test-fashion-studio.sh

set -uo pipefail

SUPABASE_URL="${SUPABASE_URL:-https://jufrdzeonywluwutvyxz.supabase.co}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q}"
APP_URL="${APP_URL:-https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"

PASS=0; FAIL=0
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }
yel()   { printf "\033[33m%s\033[0m\n" "$*"; }

expect_in() {
  local name="$1"; shift
  local actual="$1"; shift
  for code in "$@"; do
    if [[ "$actual" == "$code" ]]; then green "✓ $name → $actual"; PASS=$((PASS+1)); return; fi
  done
  red "✗ $name → got $actual, expected one of: $*"; FAIL=$((FAIL+1))
}

call_fn() {
  local fn="$1" body="${2:-{}}" auth="${3:-anon}"
  local hdr="Bearer $ANON_KEY"
  [[ "$auth" == "user" && -n "$ACCESS_TOKEN" ]] && hdr="Bearer $ACCESS_TOKEN"
  [[ "$auth" == "none" ]] && hdr=""
  curl -s -o /tmp/_fs_body.json -w "%{http_code}" \
    -X POST "$SUPABASE_URL/functions/v1/$fn" \
    -H "Content-Type: application/json" \
    ${hdr:+-H "Authorization: $hdr"} \
    -H "apikey: $ANON_KEY" \
    -d "$body"
}

rest_get() {
  local table="$1" auth="${2:-anon}"
  local hdr="Bearer $ANON_KEY"
  [[ "$auth" == "user" && -n "$ACCESS_TOKEN" ]] && hdr="Bearer $ACCESS_TOKEN"
  curl -s -o /tmp/_fs_rest.json -w "%{http_code}" \
    "$SUPABASE_URL/rest/v1/$table?select=*&limit=1" \
    -H "apikey: $ANON_KEY" -H "Authorization: $hdr"
}

echo "════════════════════════════════════════════════"
echo " /fashion-studio — automated megatest"
echo "════════════════════════════════════════════════"

yel "▸ 1. Routes"
code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/fashion-studio")
expect_in "GET /fashion-studio" "$code" 200 304 302
code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/ai-credits-store")
expect_in "GET /ai-credits-store (Buy Credits target)" "$code" 200 304 302

yel "▸ 2. RLS lockdown — anonymous reads must be empty"
for tbl in fashion_designs wardrobe_items fashion_challenges fashion_style_battles ai_credits; do
  code=$(rest_get "$tbl" anon)
  if [[ "$code" == "200" && "$(cat /tmp/_fs_rest.json)" == "[]" ]]; then
    green "✓ RLS $tbl (anon) → empty"; PASS=$((PASS+1))
  elif [[ "$code" == "200" ]]; then
    # Public table acceptable only for fashion_challenges/designs gallery — flag others
    body=$(cat /tmp/_fs_rest.json)
    if [[ "$tbl" == "fashion_challenges" || "$tbl" == "fashion_designs" ]]; then
      green "✓ RLS $tbl (anon) → 200 (public-readable, ok)"; PASS=$((PASS+1))
    else
      red "✗ RLS $tbl (anon) → 200 with data leak: $body"; FAIL=$((FAIL+1))
    fi
  else
    expect_in "RLS $tbl (anon)" "$code" 401 403
  fi
done

yel "▸ 3. Edge — auth guards (anonymous must be 401)"
for fn in fashion-ai creative-style-transfer; do
  code=$(call_fn "$fn" '{"action":"battle-score","battleTheme":"x","outfitDescription":"y"}' none)
  expect_in "POST $fn (no auth)" "$code" 401
done

yel "▸ 4. Edge — CORS preflight"
for fn in fashion-ai creative-style-transfer; do
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X OPTIONS "$SUPABASE_URL/functions/v1/$fn" \
    -H "Origin: $APP_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type")
  expect_in "OPTIONS $fn" "$code" 200 204
done

yel "▸ 5. Edge — anon JWT (no real user) must NOT get 200 with AI result"
code=$(call_fn "fashion-ai" '{"action":"battle-score","battleTheme":"glam","outfitDescription":"red dress"}' anon)
expect_in "fashion-ai battle-score (anon JWT)" "$code" 401 402 403
code=$(call_fn "fashion-ai" '{"action":"ootd-score","outfitDescription":"jeans"}' anon)
expect_in "fashion-ai ootd-score (anon JWT)" "$code" 401 402 403
code=$(call_fn "fashion-ai" '{}' anon)
expect_in "fashion-ai empty body (anon JWT)" "$code" 400 401 422

yel "▸ 6. Edge — unknown action handling (with anon JWT)"
code=$(call_fn "fashion-ai" '{"action":"definitely-not-a-real-action"}' anon)
expect_in "fashion-ai unknown action" "$code" 400 401 404 422 500

if [[ -n "$ACCESS_TOKEN" ]]; then
  yel "▸ 7. Authenticated user flow"
  for tbl in fashion_designs wardrobe_items ai_credits; do
    code=$(rest_get "$tbl" user)
    expect_in "RLS $tbl (auth)" "$code" 200
  done
  for action in battle-score ootd-score color-season trend-radar shopping-links mood-ring outfit-cost dress-code compatibility; do
    code=$(call_fn "fashion-ai" "{\"action\":\"$action\",\"battleTheme\":\"t\",\"outfitDescription\":\"d\",\"description\":\"d\",\"category\":\"streetwear\",\"skin_tone\":\"warm\",\"hair_color\":\"brown\",\"eye_color\":\"hazel\",\"undertone\":\"warm\",\"mood\":\"happy\",\"energy_level\":80,\"eventDescription\":\"wedding\",\"outfit1\":\"a\",\"outfit2\":\"b\",\"budget\":100,\"style\":\"minimal\"}" user)
    expect_in "fashion-ai action=$action (auth)" "$code" 200 402 429
  done
else
  yel "▸ 7. Authenticated tests skipped (no ACCESS_TOKEN)"
fi

echo ""
echo "════════════════════════════════════════════════"
echo " RESULT: $PASS passed, $FAIL failed"
echo "════════════════════════════════════════════════"
[[ "$FAIL" -eq 0 ]] || exit 1
