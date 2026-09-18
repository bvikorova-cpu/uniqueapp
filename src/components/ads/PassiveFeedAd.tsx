import { useEffect, useRef, useState } from "react";
import { MONETAG_ZONES, loadMonetagZone, trackMonetagEvent } from "@/lib/monetag";

/**
 * Passive (non-rewarded) in-feed ad slot.
 * Counts an impression as soon as the slot scrolls into view — no click,
 * no XP reward. Complements the rewarded "Watch & Earn" card.
 */
const PassiveFeedAd = ({ slotIndex, sectionKey = "wall_feed" }: { slotIndex: number; sectionKey?: string }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen || !ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.5)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: [0.5] },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    loadMonetagZone(MONETAG_ZONES.PASSIVE_BANNER);
    trackMonetagEvent("impression", String(MONETAG_ZONES.PASSIVE_BANNER), `${sectionKey}_passive_${slotIndex}`);
  }, [seen, sectionKey, slotIndex]);

  return (
    <div
      ref={ref}
      data-passive-ad-slot={slotIndex}
      className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 min-h-[90px] flex items-center justify-center"
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
        Advertisement
      </span>
    </div>
  );
};

export default PassiveFeedAd;
