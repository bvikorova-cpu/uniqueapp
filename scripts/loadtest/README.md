# Load Testing (k6)

Reálne meranie kapacity pred spustením miliónom používateľov.

## Inštalácia k6
```bash
brew install k6              # macOS
# alebo: https://k6.io/docs/get-started/installation/
```

## Spustenie
```bash
# Wall feed čítanie (verejný endpoint)
BASE_URL=https://uniqueapp.fun k6 run scripts/loadtest/wall-feed.js

# RPC rate limit (autentifikovaný)
SUPABASE_URL=$VITE_SUPABASE_URL \
SUPABASE_ANON_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
k6 run scripts/loadtest/rpc-rate-limit.js
```

## Cieľové čísla (baseline pred škálovaním)
| Endpoint | p95 latency | RPS |
|---|---|---|
| Wall feed GET | < 400 ms | 500 |
| Post like | < 200 ms | 200 |
| Edge fn (Uni) | < 2 s | 20 |

Ak p95 prekročí limit alebo error rate > 1 %, treba pridať cache/index/replica pred rastom trafficu.
