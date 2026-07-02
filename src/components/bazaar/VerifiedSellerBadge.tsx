import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVerifiedSellerStatus } from "./VerifiedSellersContext";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  sellerId: string;
  showPending?: boolean;
}

type Status = "verified" | "pending" | "rejected";

/** Shows a "Verified Seller" badge if the seller has KYC-verified status.
 *  Uses VerifiedSellersProvider (batched) when present; falls back to a single fetch otherwise. */
export const VerifiedSellerBadge = ({ sellerId, showPending = false }: Props) => {
  const contextStatus = useVerifiedSellerStatus(sellerId);
  const [fallback, setFallback] = useState<Status | null>(null);
  const useFallback = contextStatus === null && fallback === null;

  useEffect(() => {
    if (contextStatus !== null) return; // batched provider supplied it
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("bazaar_seller_verifications" as any)
        .select("status")
        .eq("user_id", sellerId)
        .maybeSingle();
      if (!cancelled && data) setFallback(((data as any).status) as Status);
    })();
    return () => { cancelled = true; };
  }, [sellerId, contextStatus]);

  const status: Status | null = contextStatus ?? fallback;
  if (useFallback && !status) return null;

  if (status === "verified") {
    return (
      <>
        <FloatingHowItWorks title="How Verified Seller Badge works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 gap-1">
              <BadgeCheck className="h-3 w-3" /> Verified
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Identity verified by Unique team</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      </>
      );
  }
  if (status === "pending" && showPending) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  }
  return null;
};

export default VerifiedSellerBadge;
