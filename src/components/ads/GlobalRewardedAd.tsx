import { useLocation } from "react-router-dom";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

export const GlobalRewardedAd = () => {
  const { pathname } = useLocation();

  const skipRoutes = ["/auth", "/reset-password", "/terms", "/contact"];
  if (skipRoutes.some((r) => pathname.startsWith(r)) || pathname.startsWith("/admin")) {
    return null;
  }

  const sectionKey = `page_${pathname.replace(/\//g, "_").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "root"}`.slice(0, 80);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};
