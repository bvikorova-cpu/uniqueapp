import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  sellerId: string;
  showPending?: boolean;
}

/** Shows a "Verified Seller" badge if the seller has KYC-verified status. */
export const VerifiedSellerBadge = ({ sellerId, showPending = false }: Props) => {
  const [status, setStatus] = useState<"verified" | "pending" | "rejected" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("bazaar_seller_verifications" as any)
        .select("status")
        .eq("user_id", sellerId)
        .maybeSingle();
      if (!cancelled && data) setStatus((data as any).status);
    })();
    return () => { cancelled = true; };
  }, [sellerId]);

  if (status === "verified") {
    return (
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
