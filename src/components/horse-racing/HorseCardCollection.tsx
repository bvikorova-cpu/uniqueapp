import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CardCategoryCollection, type CardCategory } from "@/components/collections/CardCategoryCollection";
import {
  warmCollectionCardImages,
  readCachedCategory,
  writeCachedCategory,
} from "@/lib/collectionCardCache";

const SLUG = "legendary-racehorses";
const CAT_KEY = "horse-card-category-v1";

const readCachedMeta = (): CardCategory | undefined => {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { row: CardCategory; savedAt: number };
    if (!parsed?.row) return undefined;
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) return undefined;
    return parsed.row;
  } catch {
    return undefined;
  }
};

/** Collectible racehorse trading cards inside the Horse Racing arena. */
export const HorseCardCollection = () => {
  const queryClient = useQueryClient();

  const { data: category, isLoading } = useQuery({
    queryKey: ["card-category", SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient, card_kind, available_from, available_until")
        .eq("slug", SLUG)
        .maybeSingle();
      if (error) throw error;
      const row = (data ?? null) as unknown as CardCategory | null;
      if (row) {
        try {
          localStorage.setItem(CAT_KEY, JSON.stringify({ row, savedAt: Date.now() }));
        } catch {
          /* best effort */
        }
      }
      return row;
    },
    initialData: () => readCachedMeta(),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Prime the card catalogue + persistent image cache so the album renders instantly.
  useEffect(() => {
    const cached = readCachedCategory<any[]>(SLUG);
    if (cached?.length) {
      queryClient.setQueryData(["card-catalogue", SLUG], cached);
      warmCollectionCardImages(cached.map((c) => c.image_url));
    }

    queryClient
      .prefetchQuery({
        queryKey: ["card-catalogue", SLUG],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("card_collectibles")
            .select("id, code, card_index, name, subject, rarity, lore, emoji, gradient, image_url, is_prime, stats")
            .eq("category_slug", SLUG)
            .eq("is_prime", false)
            .order("card_index", { ascending: true });
          if (error) throw error;
          const rows = (data ?? []) as any[];
          writeCachedCategory(SLUG, rows);
          return rows;
        },
        staleTime: 10 * 60 * 1000,
      })
      .then(() => {
        const rows = queryClient.getQueryData<any[]>(["card-catalogue", SLUG]);
        if (rows?.length) warmCollectionCardImages(rows.map((c) => c.image_url));
      })
      .catch(() => {
        /* offline – cached data stays visible */
      });
  }, [queryClient]);

  if (isLoading && !category) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
      </div>
    );
  }

  if (!category) {
    return (
      <Card className="p-8 text-center bg-white border-amber-300/60">
        <p className="font-bold mb-1 text-slate-900">Card collection unavailable</p>
        <p className="text-sm text-muted-foreground">Please try again in a moment.</p>
      </Card>
    );
  }

  return <CardCategoryCollection category={category} />;
};
