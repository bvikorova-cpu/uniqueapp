import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CardCategoryCollection, type CardCategory } from "@/components/collections/CardCategoryCollection";

const SLUG = "legendary-racehorses";

/** Collectible racehorse trading cards inside the Horse Racing arena. */
export const HorseCardCollection = () => {
  const { data: category, isLoading } = useQuery({
    queryKey: ["card-category", SLUG],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_categories")
        .select("slug, name, description, emoji, gradient, card_kind, available_from, available_until")
        .eq("slug", SLUG)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as CardCategory | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
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
