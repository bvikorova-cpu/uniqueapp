import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const REWARDS_COSMETICS_UPDATED = "rewards-cosmetics-updated";

export type RewardsCosmeticSlugs = {
  avatar_frame?: string;
  name_color?: string;
  profile_theme?: string;
  animated_border?: string;
  /** verification tier of the user (verified / plus / pro), used for the global tier ring */
  verification_tier?: string | null;
};

export type RewardsCosmeticsMap = Record<string, RewardsCosmeticSlugs>;

const cache = new Map<string, RewardsCosmeticSlugs>();

/**
 * Many components ask for the same set of user ids on the same page load
 * (feed cards, avatars, leaderboards). Share one in-flight request per key
 * instead of firing the same RPC pair several times.
 */
const inflight = new Map<string, Promise<RewardsCosmeticsMap>>();
const fetchedAt = new Map<string, number>();
const TTL_MS = 60_000;

/**
 * Cross-component batching: every card/avatar asking for cosmetics in the same
 * tick is coalesced into ONE pair of requests instead of one pair per card
 * (the feed used to fire 2 requests per post).
 */
let pendingIds = new Set<string>();
let pendingPromise: Promise<void> | null = null;

function scheduleCosmetics(ids: string[]): Promise<void> {
  ids.forEach((id) => pendingIds.add(id));
  if (pendingPromise) return pendingPromise;

  pendingPromise = new Promise<void>((resolve) => {
    setTimeout(async () => {
      const batch = Array.from(pendingIds);
      pendingIds = new Set();
      pendingPromise = null;
      if (batch.length === 0) { resolve(); return; }
      try {
        const next: RewardsCosmeticsMap = {};
        batch.forEach((id) => { next[id] = {}; });
        const [{ data }, { data: tiers }] = await Promise.all([
          supabase.rpc("get_equipped_rewards_cosmetics" as never, { _user_ids: batch } as never),
          supabase.from("profiles_public").select("id, verification_tier" as never).in("id", batch),
        ]);
        ((data as { user_id: string; category: string; slug: string }[]) || []).forEach((row) => {
          next[row.user_id] = { ...next[row.user_id], [row.category]: row.slug };
        });
        ((tiers as unknown as { id: string; verification_tier: string | null }[]) || []).forEach((row) => {
          next[row.id] = { ...next[row.id], verification_tier: row.verification_tier };
        });
        batch.forEach((id) => {
          cache.set(id, next[id] ?? {});
          fetchedAt.set(id, Date.now());
        });
      } catch {
        // keep previous cache on failure
      }
      resolve();
    }, 30);
  });

  return pendingPromise;
}

async function fetchCosmetics(key: string, ids: string[], force = false): Promise<RewardsCosmeticsMap> {
  const stale = force
    ? ids
    : ids.filter((id) => {
        const at = fetchedAt.get(id) || 0;
        return Date.now() - at >= TTL_MS;
      });
  if (stale.length > 0) await scheduleCosmetics(stale);
  const next: RewardsCosmeticsMap = {};
  ids.forEach((id) => { next[id] = cache.get(id) ?? {}; });
  fetchedAt.set(key, Date.now());
  return next;
}

/**
 * Public lookup of the Rewards cosmetics (avatar frame, name color, profile
 * theme, animated border) other users have equipped, so purchased items are
 * actually visible on profiles, the feed and leaderboards.
 */
export function useRewardsCosmetics(userIds: (string | null | undefined)[]): RewardsCosmeticsMap {
  const key = Array.from(new Set(userIds.filter(Boolean) as string[])).sort().join(",");
  const [map, setMap] = useState<RewardsCosmeticsMap>(() => {
    const seed: RewardsCosmeticsMap = {};
    (key ? key.split(",") : []).forEach((id) => {
      const c = cache.get(id);
      if (c) seed[id] = c;
    });
    return seed;
  });

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (ids.length === 0) {
      setMap({});
      return;
    }
    let alive = true;

    const load = async (force = false) => {
      const last = fetchedAt.get(key) || 0;
      const fresh = !force && Date.now() - last < TTL_MS;
      if (fresh) {
        const seed: RewardsCosmeticsMap = {};
        ids.forEach((id) => { seed[id] = cache.get(id) ?? {}; });
        setMap(seed);
        return;
      }
      try {
        const next = await fetchCosmetics(key, ids, force);
        if (alive) setMap(next);
      } catch {
        // keep previous state on failure
      }
    };

    load();
    const handler = () => { fetchedAt.delete(key); load(true); };
    window.addEventListener(REWARDS_COSMETICS_UPDATED, handler);
    return () => {
      alive = false;
      window.removeEventListener(REWARDS_COSMETICS_UPDATED, handler);
    };
  }, [key]);

  return map;
}

/** Convenience wrapper for a single user. */
export function useRewardsCosmeticsFor(userId?: string | null): RewardsCosmeticSlugs {
  const map = useRewardsCosmetics([userId]);
  return (userId ? map[userId] : undefined) ?? {};
}
