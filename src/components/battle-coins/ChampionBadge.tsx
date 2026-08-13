import { Crown, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { championRankClasses, type ChampionBadge as ChampionBadgeData } from "@/hooks/useChampionBadges";

const LABEL: Record<number, string> = { 1: "KING", 2: "2ND", 3: "3RD" };

/** Small monthly-champion marker shown next to a name. Gold for 1st place. */
export default function ChampionBadge({ badge, className = "" }: { badge?: ChampionBadgeData | null; className?: string }) {
  if (!badge) return null;
  const c = championRankClasses(badge.rank);
  return (
    <Badge variant="outline" className={`gap-1 px-1.5 py-0 text-[10px] font-bold ${c.border} ${c.text} ${className}`}>
      {badge.rank === 1 ? <Crown className="h-3 w-3" /> : <Medal className="h-3 w-3" />}
      {LABEL[badge.rank]}
    </Badge>
  );
}
