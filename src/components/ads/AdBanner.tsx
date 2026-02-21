import { useEffect, useRef } from "react";

interface AdBannerProps {
  adSlot: string;
  className?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
}

/**
 * Google AdSense Banner component
 * 
 * Usage:
 * <AdBanner adSlot="1234567890" format="auto" />
 * 
 * The ad client ID (ca-pub-3821622017213888) is loaded via index.html.
 * You only need the ad slot ID from your AdSense dashboard.
 */

const ADSENSE_ENABLED = true;
const AD_CLIENT = "ca-pub-3821622017213888";

const AdBanner = ({ adSlot, className = "", format = "auto", responsive = true }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED || isAdLoaded.current) return;

    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [adSlot]);

  if (!ADSENSE_ENABLED) return null;

  return (
    <div ref={adRef} className={`ad-container mx-auto ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default AdBanner;
