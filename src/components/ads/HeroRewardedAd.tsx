import { useEffect, useRef, useState } from "react";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

interface Props {
  /** Unique key per section so the daily 3x limit is independent per page */
  sectionKey: string;
  className?: string;
}

/**
 * Watch & Earn 5 XP card placed directly under the hero of a section.
 * Lazy-mounts the actual ad card once the placeholder is near the viewport,
 * avoiding the cost of loading the rewarded ad on every page mount.
 */
export const HeroRewardedAd = ({ sectionKey, className = "" }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || !ref.current || typeof IntersectionObserver === "undefined") {
      if (!visible && typeof IntersectionObserver === "undefined") setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={`max-w-3xl mx-auto mb-6 min-h-[80px] ${className}`}>
      {visible && <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />}
    </div>
  );
};

export default HeroRewardedAd;
