import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RewardedAdCard from "./RewardedAdCard";
import { AD_PLACEMENTS } from "./AdPlacements";

/**
 * Global "Watch & Earn" card mounted once per page near the end of content.
 * - Hidden on auth / legal / admin routes
 * - Hidden if a page already renders its own <RewardedAdCard> (HeroRewardedAd)
 *   to avoid duplicates and keep it out of the hero area.
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
    // Wait for lazy route content to mount, then check for existing rewarded ads.
    const t = window.setTimeout(() => {
      const existing = document.querySelectorAll("[data-rewarded-ad-card]").length;
      setHasLocalAd(existing > 1); // >1 because we render one ourselves
    }, 500);
    return () => window.clearTimeout(t);
  }, [pathname, skip]);

  if (skip || hasLocalAd) return null;

  const sectionKey = `page_${pathname.replace(/\//g, "_").replace(/[^a-z0-9_]/gi, "").toLowerCase() || "root"}`.slice(0, 80);

  return (
    <div className="max-w-3xl mx-auto px-3 my-6" data-rewarded-ad-global>
      <RewardedAdCard sectionKey={sectionKey} adSlot={AD_PLACEMENTS.FOOTER_BANNER} />
    </div>
  );
};

export default GlobalRewardedAd;
