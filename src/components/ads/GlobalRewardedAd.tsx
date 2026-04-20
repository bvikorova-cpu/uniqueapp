import { useLocation } from "react-router-dom";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

/**
 * Global rewarded ad shown at the bottom of every page.
 * Section key is derived from the route so the daily limit (3x)
 * applies independently per page/section.
 */
export const GlobalRewardedAd = () => {
  const { pathname } = useLocation();

  // Skip on auth/legal/admin routes where ads don't fit
  const skipRoutes = ["/auth", "/reset-password", "/terms", "/contact"];
  if (skipRoutes.some((r) => pathname.startsWith(r)) || pathname.startsWith("/admin")) {
    return null;
  }

  // Normalize pathname into a stable section key
  const sectionKey = `page_${pathname.replace(/\//g, "_").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "root"}`.slice(0, 80);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-6 pt-2">
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};
