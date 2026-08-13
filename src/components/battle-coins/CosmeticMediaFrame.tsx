import type { ReactNode } from "react";
import { championRankClasses } from "@/hooks/useChampionBadges";

/**
 * Frames a duel video/image with the creator's equipped Battle Coins frame
 * cosmetic, and overlays their equipped sticker + badge on top of the media so
 * purchased cosmetics are visible right on the duel card. A monthly champion's
 * rank frame (gold/silver/bronze) always wins, so the "gold framed videos"
 * perk stays visible.
 */
export default function CosmeticMediaFrame({
  frameClass,
  championRank,
  sticker,
  badge,
  children,
}: {
  frameClass?: string | null;
  championRank?: number | null;
  sticker?: { name: string; preview: string | null } | null;
  badge?: { name: string; preview: string | null } | null;
  children: ReactNode;
}) {
  const champ = championRankClasses(championRank);
  const ring = champ.ring || frameClass || "";
  const hasOverlay = !!(sticker?.preview || badge?.preview);

  const overlay = hasOverlay ? (
    <>
      {sticker?.preview && (
        <span
          title={sticker.name}
          aria-label={sticker.name}
          className="pointer-events-none absolute top-2 right-2 text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        >
          {sticker.preview}
        </span>
      )}
      {badge?.preview && (
        <span
          title={badge.name}
          aria-label={badge.name}
          className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-sm backdrop-blur-sm"
        >
          {badge.preview}
        </span>
      )}
    </>
  ) : null;

  if (!ring) {
    return (
      <div className="relative">
        {children}
        {overlay}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl p-1 ${ring}`}>
      <div className="rounded-lg overflow-hidden">{children}</div>
      {overlay}
    </div>
  );
}
