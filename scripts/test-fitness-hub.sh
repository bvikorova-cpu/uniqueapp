#!/usr/bin/env bash
# Megakontrola: /fit-slim + /fitness-wellness
set -u
SUPA="https://jufrdzeonywluwutvyxz.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"
PREVIEW="https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app"
PASS=0; FAIL=0
chk() { local name="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then echo "✅ $name -> $got"; PASS=$((PASS+1))
  else echo "❌ $name expected $want got $got"; FAIL=$((FAIL+1)); fi
}

echo "── Edge funkcie bez auth (401) ──"
for fn in create-fitslim-checkout verify-fitslim-payment generate-fitness-plan generate-gift-message generate-workout-plan; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPA/functions/v1/$fn" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{}')
  chk "$fn no-auth" 401 "$c"
done

echo ""; echo "── Edge funkcie s neplatným JWT (401) ──"
for fn in create-fitslim-checkout verify-fitslim-payment generate-fitness-plan; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPA/functions/v1/$fn" -H "apikey: $KEY" -H "Authorization: Bearer bad.jwt.token" -H "Content-Type: application/json" -d '{}')
  chk "$fn bad-jwt" 401 "$c"
done

echo ""; echo "── CORS preflight (200) ──"
for fn in create-fitslim-checkout verify-fitslim-payment generate-fitness-plan generate-gift-message generate-workout-plan; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/functions/v1/$fn" -H "Origin: https://uniqueapp.fun" -H "Access-Control-Request-Method: POST")
  chk "$fn OPTIONS" 200 "$c"
done

echo ""; echo "── RLS anonymous SELECT (prázdne) ──"
body=$(curl -s "$SUPA/rest/v1/fitness_plans?select=*&limit=5" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
chk "fitness_plans anon empty" "[]" "$body"

echo ""; echo "── Routes (302 redirect na app) ──"
for r in /fit-slim /fitness-wellness; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW$r")
  chk "route $r" 302 "$c"
done

echo ""; echo "════════════════════════════════"
echo "PASS: $PASS  FAIL: $FAIL"
[ $FAIL -eq 0 ]
