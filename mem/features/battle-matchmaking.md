---
name: Battle auto-matchmaking queue
description: Instant random opponent pairing for KitchenStars and Clip Battles duels via battle_matchmaking_queue.
type: feature
---

- Table `battle_matchmaking_queue` (module, title, description, video_url, media_size/mime, status waiting|matched|cancelled, battle_id). One waiting row per (user, module) enforced by a partial unique index.
- `join_battle_queue(_module,_title,_description,_video_url,_media_size,_media_mime)`: charges 100 Battle Coins from that module's wallet, then picks a RANDOM waiting opponent (`ORDER BY random() FOR UPDATE SKIP LOCKED`). On match it creates the duel (`kitchen_battles` / `reel_battles`, prize_pool 200, 7-day deadline) with both participants inserted and notifies the waiting player (`battle_matched`). No opponent → stays waiting.
- `leave_battle_queue(_module)`: cancels a waiting row and refunds the full 100 coins.
- `get_battle_queue_status(_module)`: `{waiting_count, in_queue, my_title, since}`.
- Frontend: `src/components/battle-coins/AutoMatchQueue.tsx` (upload to `wall-media`, 20s status poll), mounted in `KitchenStarsBattles.tsx` and `ReelBattles.tsx` above the manual "Start duel" flow, which stays available.
- Megatalent is intentionally NOT supported (bracket/tournament format) — RPC raises `MODULE_NOT_SUPPORTED`.
