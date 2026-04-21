import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

interface Props {
  /** Unique key per section so the daily 3x limit is independent per page */
  sectionKey: string;
  className?: string;
}

/**
 * Watch & Earn 5 XP card placed directly under the hero of a section.
 * Use this on every hub page (Jobs, Marketplace, Coffee, etc.) right
 * after the cinematic hero block.
 */
export const HeroRewardedAd = ({ sectionKey, className = "" }: Props) => {
  return (
    <div className={`max-w-3xl mx-auto mb-6 ${className}`}>
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};

export default HeroRewardedAd;
