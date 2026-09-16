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

async function fetchCosmetics(key: string, ids: string[]): Promise<RewardsCosmeticsMap> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const next: RewardsCosmeticsMap = {};
    ids.forEach((id) => { next[id] = {}; });
    const [{ data, error }, { data: tiers }] = await Promise.all([
      supabase.rpc("get_equipped_rewards_cosmetics" as never, { _user_ids: ids } as never),
      supabase.from("profiles_public").select("id, verification_tier" as never).in("id", ids),
    ]);
    if (error) throw error;
    ((data as { user_id: string; category: string; slug: string }[]) || []).forEach((row) => {
      next[row.user_id] = { ...next[row.user_id], [row.category]: row.slug };
    });
    ((tiers as unknown as { id: string; verification_tier: string | null }[]) || []).forEach((row) => {
      next[row.id] = { ...next[row.id], verification_tier: row.verification_tier };
    });
    ids.forEach((id) => cache.set(id, next[id] ?? {}));
    fetchedAt.set(key, Date.now());
    return next;
  })().finally(() => { inflight.delete(key); });

  inflight.set(key, promise);
  return promise;
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

    const load = async () => {
      const { data, error } = await supabase.rpc("get_equipped_rewards_cosmetics" as never, {
        _user_ids: ids,
      } as never);
      if (!alive || error) return;
      const next: RewardsCosmeticsMap = {};
      ids.forEach((id) => { next[id] = {}; });
      ((data as { user_id: string; category: string; slug: string }[]) || []).forEach((row) => {
        next[row.user_id] = { ...next[row.user_id], [row.category]: row.slug };
      });
      // Tier-aware ring: VIP / Verified users keep their gold (or tier) frame everywhere.
      const { data: tiers } = await supabase
        .from("profiles_public")
        .select("id, verification_tier" as never)
        .in("id", ids);
      if (!alive) return;
      ((tiers as unknown as { id: string; verification_tier: string | null }[]) || []).forEach((row) => {
        next[row.id] = { ...next[row.id], verification_tier: row.verification_tier };
      });
      ids.forEach((id) => cache.set(id, next[id] ?? {}));
      setMap(next);
    };

    load();
    const handler = () => load();
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
