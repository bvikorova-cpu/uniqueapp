import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BATTLE_COINS_UPDATED } from "@/hooks/useBattleCoins";

export type EquippedCosmetic = {
  kind: string;
  code: string;
  name: string;
  preview: string | null;
  css_class: string | null;
};

export type EquippedMap = Record<string, Partial<Record<"frame" | "sticker" | "badge", EquippedCosmetic>>>;

/**
 * Public lookup of the cosmetics other players have equipped, so purchased frames,
 * stickers and badges are actually visible on leaderboards and duel cards.
 */
export function useEquippedCosmetics(userIds: (string | null | undefined)[]) {
  const [map, setMap] = useState<EquippedMap>({});
  const key = Array.from(new Set(userIds.filter(Boolean) as string[])).sort().join(",");

  useEffect(() => {
    const ids = key ? key.split(",") : [];
    if (ids.length === 0) { setMap({}); return; }
    let alive = true;

    const load = async () => {
      const { data, error } = await supabase.rpc("get_equipped_battle_cosmetics", { _user_ids: ids });
      if (!alive || error) return;
      const next: EquippedMap = {};
      ((data as (EquippedCosmetic & { user_id: string })[]) || []).forEach((row) => {
        next[row.user_id] = { ...next[row.user_id], [row.kind]: row };
      });
      setMap(next);
    };

    load();
    const handler = () => load();
    window.addEventListener(BATTLE_COINS_UPDATED, handler);
    return () => { alive = false; window.removeEventListener(BATTLE_COINS_UPDATED, handler); };
  }, [key]);

  return map;
}
