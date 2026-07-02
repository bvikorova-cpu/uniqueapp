import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  sellerId: string;
  size?: "sm" | "md";
  className?: string;
}

interface Summary {
  rating_count: number;
  avg_rating: number | null;
}

/** Inline badge displaying seller's average rating + count. */
export const SellerRatingBadge = ({ sellerId, size = "sm", className }: Props) => {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: row } = await supabase
        .from("bazaar_seller_rating_summary" as any)
        .select("rating_count, avg_rating")
        .eq("seller_id", sellerId)
        .maybeSingle();
      if (!cancelled) setData((row as any) ?? { rating_count: 0, avg_rating: null });
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  if (!data || data.rating_count === 0) {
    return (
      <>
        <FloatingHowItWorks title="How Seller Rating Badge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <span className={cn("inline-flex items-center gap-1 text-muted-foreground", size === "sm" ? "text-xs" : "text-sm", className)}>
        <Star className="h-3.5 w-3.5" />
        New seller
      </span>
      </>
      );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", size === "sm" ? "text-xs" : "text-sm", className)}>
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold">{Number(data.avg_rating).toFixed(1)}</span>
      <span className="text-muted-foreground">({data.rating_count})</span>
    </span>
  );
};

export default SellerRatingBadge;
