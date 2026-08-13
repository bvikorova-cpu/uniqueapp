import type { ReactNode } from "react";
import { championRankClasses } from "@/hooks/useChampionBadges";

/**
 * Frames a duel video/image with the creator's equipped Battle Coins frame
 * cosmetic. A monthly champion's rank frame (gold/silver/bronze) always wins,
 * so the "gold framed videos" perk stays visible.
 */
export default function CosmeticMediaFrame({
  frameClass,
  championRank,
  children,
}: {
  frameClass?: string | null;
  championRank?: number | null;
  children: ReactNode;
}) {
  const champ = championRankClasses(championRank);
  const ring = champ.ring || frameClass || "";
  if (!ring) return <>{children}</>;
  return (
    <div className={`rounded-lg overflow-hidden ring-offset-2 ring-offset-background ${ring}`}>
      {children}
    </div>
  );
}
