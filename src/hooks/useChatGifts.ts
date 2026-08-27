import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GiftBubbleData } from "@/components/gifts/GiftBubble";

/**
 * Loads the active gift catalog once and exposes a slug/id lookup so chat
 * bubbles can render a gift message without extra round-trips per message.
 */
export function useChatGifts() {
  const [giftsById, setGiftsById] = useState<Record<string, GiftBubbleData>>({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("gift_catalog")
        .select("id, slug, name, price_credits, rarity, animation, image_url");

      if (cancelled || !data) return;
      const map: Record<string, GiftBubbleData> = {};
      data.forEach((g: any) => {
        map[g.id] = {
          slug: g.slug,
          name: g.name,
          price_credits: g.price_credits,
          rarity: g.rarity,
          animation: g.animation,
          image_url: g.image_url,
        };
      });
      setGiftsById(map);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { giftsById };
}
