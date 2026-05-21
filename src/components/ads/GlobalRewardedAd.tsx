import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

/**
 * Global "Watch & Earn" card mounted once per page.
 * - Hidden on auth / legal / admin routes
 * - Hidden if a page already renders its own <RewardedAdCard> (HeroRewardedAd)
 *   to avoid duplicates and empty white space.
 */
export const GlobalRewardedAd = () => {
  const { pathname } = useLocation();
  const [hasLocalAd, setHasLocalAd] = useState(false);

  const skip =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    if (skip) return;
    // Wait one frame for the page to mount, then check for existing rewarded ads.
    const t = window.setTimeout(() => {
      const existing = document.querySelectorAll("[data-rewarded-ad-card]").length;
      setHasLocalAd(existing > 1); // >1 because we render one ourselves
    }, 100);
    return () => window.clearTimeout(t);
  }, [pathname, skip]);

  if (skip || hasLocalAd) return null;

  const sectionKey = `page_${pathname.replace(/\//g, "_").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "root"}`.slice(0, 80);

  return (
    <div className="max-w-3xl mx-auto px-3 mt-2" data-rewarded-ad-global>
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};

export default GlobalRewardedAd;
