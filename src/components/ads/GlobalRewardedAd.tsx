import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";
import { loadAllMonetagZones } from "@/lib/monetag";

/**
 * Global rewarded ad shown on EVERY page, placed right under the
 * navbar/announcement banner so it's visible at the top of the
 * content. Section key is derived from the route so the daily
 * limit (3x) applies independently per page/section.
 */
export const GlobalRewardedAd = () => {
  const { pathname } = useLocation();

  // Skip on auth/legal/admin routes where ads don't fit
  const skipRoutes = ["/auth", "/reset-password", "/terms", "/contact"];
  const skip = skipRoutes.some((r) => pathname.startsWith(r)) || pathname.startsWith("/admin");

  // Auto-load all Monetag revenue zones (popunder, in-page push, vignette)
  // on every page so ads serve even when user doesn't click "Watch Ad".
  useEffect(() => {
    if (!skip) loadAllMonetagZones();
  }, [skip, pathname]);

  if (skip) return null;

  // Normalize pathname into a stable section key
  const sectionKey = `page_${pathname.replace(/\//g, "_").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "root"}`.slice(0, 80);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};
