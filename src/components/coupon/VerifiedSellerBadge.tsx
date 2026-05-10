import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { useVerifiedCouponSeller } from "@/hooks/useVerifiedCouponSeller";

export function VerifiedSellerBadge({ sellerId }: { sellerId: string | null | undefined }) {
  const verified = useVerifiedCouponSeller(sellerId);
  if (!verified) return null;
  return (
    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 gap-1">
      <BadgeCheck className="w-3 h-3" /> Verified seller
    </Badge>
  );
}
