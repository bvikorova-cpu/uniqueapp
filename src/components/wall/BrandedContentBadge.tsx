import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

interface Props {
  partnerName?: string | null;
  disclosure?: string | null;
}

export function BrandedContentBadge({ partnerName, disclosure }: Props) {
  if (!partnerName) return null;
  return (
    <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-400">
      <Megaphone className="h-3 w-3" />
      Paid partnership · {partnerName}
      {disclosure && <span className="text-[10px] opacity-70">— {disclosure}</span>}
    </Badge>
  );
}
