import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { warmCollectionCardImages } from "@/lib/collectionCardCache";

/**
 * Pre-generates and pre-caches collectible-card artwork for a group of sets.
 *
 * Runs quietly in the background from listing pages (Collectible Cards and Kids
 * Collectibles) so cards already have illustrations — and those illustrations are
 * already in the persistent image cache — before the collector opens a set.
 */
export function useCardArtPrewarm(slugs: string[], enabled = true) {
  const [missing, setMissing] = useState<number | null>(null);

  const key = slugs.slice().sort().join(",");

  useEffect(() => {
    if (!enabled || !key) return;
    const list = key.split(",");
    let stop = false;

    // 1) Warm the images that already exist so the album opens instantly.
    const warmExisting = async () => {
      const { data } = await supabase
        .from("card_collectibles")
        .select("image_url")
        .in("category_slug", list)
        .not("image_url", "is", null)
        .order("card_index", { ascending: true })
        .limit(400);
      if (stop) return;
      warmCollectionCardImages((data ?? []).map((r) => r.image_url as string));
    };

    // 2) Keep generating whatever is still missing, batch by batch.
    const generate = async () => {
      let rounds = 0;
      while (!stop && rounds < 60) {
        const { data, error } = await supabase.functions.invoke("hero-card-draw", {
          body: { scope: "collection", action: "backfill_art", categories: list, limit: 12 },
        });
        if (stop || error || !data || data.error) return;
        setMissing(data.missing ?? 0);
        rounds += 1;
        if (!data.missing || !data.generated) return;
        // Warm the batch that was just painted.
        void warmExisting();
        await new Promise((r) => setTimeout(r, 1500));
      }
    };

    const idle = window.setTimeout(() => {
      void warmExisting();
      void generate();
    }, 700);

    return () => {
      stop = true;
      window.clearTimeout(idle);
    };
  }, [key, enabled]);

  return { missing };
}
