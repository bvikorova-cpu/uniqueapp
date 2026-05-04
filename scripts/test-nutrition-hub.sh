#!/usr/bin/env bash
# Megakontrola pre /nutrition-hub
# - Routes
# - RLS (anonymné dotazy musia vrátiť 0 / unauthorized)
# - Edge functions (musia vrátiť 401 bez JWT)
# - CORS preflight
# Ak je nastavený ACCESS_TOKEN, otestuje aj 402 logiku.
set -u

SUPABASE_URL="${SUPABASE_URL:-https://jufrdzeonywluwutvyxz.supabase.co}"
ANON_KEY="${ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q}"
APP_URL="${APP_URL:-https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"

PASS=0; FAIL=0
ok() { echo "  ✅ $1"; PASS=$((PASS+1)); }
ko() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

check_status() {
  local label="$1"; local expected="$2"; local actual="$3"
  for code in $expected; do
    if [ "$actual" = "$code" ]; then ok "$label → $actual"; return; fi
  done
  ko "$label → got $actual (expected $expected)"
}

echo "=== 1. Routes ==="
for path in /nutrition-hub /nutrition-subscriptions /ai-credits-store /auth; do
  st=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}${path}")
  check_status "GET $path" "200 301 302 304" "$st"
done

echo ""
echo "=== 2. Anonymous RLS lockdown (must return [] or 401) ==="
for tbl in ai_credits cooking_credits food_scans meal_plans workout_plans nutrition_subscriptions; do
  body=$(curl -s -H "apikey: $ANON_KEY" "${SUPABASE_URL}/rest/v1/${tbl}?select=*&limit=1")
  if [ "$body" = "[]" ] || echo "$body" | grep -q "JWT"; then
    ok "RLS $tbl (anon blocked)"
  else
    ko "RLS $tbl returned: $(echo "$body" | head -c 120)"
  fi
done

echo ""
echo "=== 3. Edge functions reject anonymous (expect 401) ==="
FNS=(nutrition-allergy-scanner nutrition-barcode-scanner nutrition-body-predictor \
     nutrition-coach-chat nutrition-grocery-optimizer nutrition-hydration-coach \
     nutrition-meal-challenge nutrition-supplement-advisor nutrition-weekly-progress \
     scan-food generate-meal-plan analyze-restaurant-menu generate-workout-plan)
for fn in "${FNS[@]}"; do
  st=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
    -d '{}' "${SUPABASE_URL}/functions/v1/${fn}")
  check_status "POST $fn (no JWT)" "401" "$st"
done

echo ""
echo "=== 4. CORS preflight (expect 200/204) ==="
for fn in nutrition-coach-chat scan-food generate-meal-plan; do
  st=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: https://example.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: authorization,content-type" \
    "${SUPABASE_URL}/functions/v1/${fn}")
  check_status "OPTIONS $fn" "200 204" "$st"
done

echo ""
echo "=== 5. create-checkout reachable (expect 401 without JWT) ==="
st=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d '{"priceId":"test"}' "${SUPABASE_URL}/functions/v1/create-checkout")
check_status "POST create-checkout (no JWT)" "401 400" "$st"

if [ -n "$ACCESS_TOKEN" ]; then
  echo ""
  echo "=== 6. Authenticated smoke (expect 200 or 402) ==="
  for fn in scan-food nutrition-hydration-coach; do
    st=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" -d '{"input":"test"}' \
      "${SUPABASE_URL}/functions/v1/${fn}")
    check_status "POST $fn (auth)" "200 402" "$st"
  done
fi

echo ""
echo "==============================="
echo " PASS: $PASS   FAIL: $FAIL"
echo "==============================="
[ "$FAIL" -eq 0 ]
