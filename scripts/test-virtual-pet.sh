#!/usr/bin/env bash
# Megakontrola: /virtual-pet
set -u
SUPA="https://jufrdzeonywluwutvyxz.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"
PREVIEW="https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app"
PASS=0; FAIL=0
chk() { local name="$1" want="$2" got="$3"
  if [ "$want" = "$got" ]; then echo "✅ $name -> $got"; PASS=$((PASS+1))
  else echo "❌ $name expected $want got $got"; FAIL=$((FAIL+1)); fi
}

PET_FUNCS="pet-name-generator pet-mood-analyzer pet-health-predictor pet-personality-coach pet-compatibility-checker pet-story-generator pet-training-planner pet-battle-strategy battle-pets pet-purchase-item pet-translator-ai"

echo "── Edge funkcie bez auth (401) ──"
for fn in $PET_FUNCS; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPA/functions/v1/$fn" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{}')
  chk "$fn no-auth" 401 "$c"
done

echo ""; echo "── Edge funkcie s neplatným JWT (401) ──"
for fn in $PET_FUNCS; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPA/functions/v1/$fn" -H "apikey: $KEY" -H "Authorization: Bearer bad.jwt.token" -H "Content-Type: application/json" -d '{}')
  chk "$fn bad-jwt" 401 "$c"
done

echo ""; echo "── CORS preflight (200) ──"
for fn in $PET_FUNCS; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SUPA/functions/v1/$fn" -H "Origin: https://uniqueapp.fun" -H "Access-Control-Request-Method: POST")
  chk "$fn OPTIONS" 200 "$c"
done

echo ""; echo "── RLS anonymous SELECT (user-scoped tabuľky → []) ──"
for tbl in pets pet_battles pet_breeding pet_trades pet_game_scores user_pet_accessories ai_credits ai_usage_history; do
  body=$(curl -s "$SUPA/rest/v1/$tbl?select=*&limit=5" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
  chk "RLS $tbl anon empty" "[]" "$body"
done

echo ""; echo "── Katalóg tabuľky verejné (200) ──"
for tbl in pet_types pet_accessories pet_mystery_boxes; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$SUPA/rest/v1/$tbl?select=id&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
  chk "catalog $tbl" 200 "$c"
done

echo ""; echo "── Route /virtual-pet (302) ──"
c=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW/virtual-pet")
chk "route /virtual-pet" 302 "$c"

echo ""; echo "════════════════════════════════"
echo "PASS: $PASS  FAIL: $FAIL"
[ $FAIL -eq 0 ]
