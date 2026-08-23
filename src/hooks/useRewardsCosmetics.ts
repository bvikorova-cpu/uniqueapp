import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const REWARDS_COSMETICS_UPDATED = "rewards-cosmetics-updated";

export type RewardsCosmeticSlugs = {
  avatar_frame?: string;
  name_color?: string;
  profile_theme?: string;
  animated_border?: string;
};

export type RewardsCosmeticsMap = Record<string, RewardsCosmeticSlugs>;

const cache = new Map<string, RewardsCosmeticSlugs>();

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
