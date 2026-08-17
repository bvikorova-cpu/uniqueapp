import { Badge } from "@/components/ui/badge";
import { Crown, Flame } from "lucide-react";

function fmtDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function PromotionBadge({
  featuredUntil,
  premiumUntil,
  showDates = true,
  size = "sm",
}: {
  featuredUntil?: string | null;
  premiumUntil?: string | null;
  showDates?: boolean;
  size?: "sm" | "xs";
}) {
  const now = Date.now();
  const premiumActive = !!premiumUntil && new Date(premiumUntil).getTime() > now;
  const topActive = !premiumActive && !!featuredUntil && new Date(featuredUntil).getTime() > now;

  const textClass = size === "xs" ? "text-[10px]" : "text-xs";

  if (premiumActive) {
    return (
      <div className="flex flex-col items-end">
        <Badge className="gap-1 bg-amber-500 text-amber-50 hover:bg-amber-500">
          <Crown className="h-3 w-3" /> Premium
        </Badge>
        {showDates && (
          <span className={`${textClass} text-muted-foreground mt-0.5`}>
            until {fmtDate(premiumUntil)}
          </span>
        )}
      </div>
    );
  }

  if (topActive) {
    return (
      <div className="flex flex-col items-end">
        <Badge className="gap-1"><Flame className="h-3 w-3" /> Top</Badge>
        {showDates && (
          <span className={`${textClass} text-muted-foreground mt-0.5`}>
            until {fmtDate(featuredUntil)}
          </span>
        )}
      </div>
    );
  }

  return null;
}
