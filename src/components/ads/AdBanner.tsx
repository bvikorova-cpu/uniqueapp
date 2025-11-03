import { useEffect, useRef } from "react";

interface AdBannerProps {
  placementId: string;
  className?: string;
  format?: "banner" | "rectangle" | "leaderboard" | "sidebar";
}

/**
 * Universal Ad Banner component for Ezoic integration
 * 
 * Usage:
 * <AdBanner placementId="ezoic-pub-ad-placeholder-101" format="banner" />
 * 
 * To activate:
 * 1. Register at ezoic.com and get your Publisher ID
 * 2. Add Ezoic script to index.html
 * 3. Replace EZOIC_ENABLED with true in this file
 * 4. Replace placeholder IDs with real Ezoic placement IDs
 */

// 🔧 SET TO TRUE WHEN READY TO SHOW ADS
const EZOIC_ENABLED = false;

const AdBanner = ({ placementId, className = "", format = "banner" }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (EZOIC_ENABLED && adRef.current && window.ezstandalone) {
      // Ezoic will automatically populate this div
      window.ezstandalone.define(placementId);
      window.ezstandalone.display();
    }
  }, [placementId]);

  // Don't render anything if ads are disabled
  if (!EZOIC_ENABLED) {
    return null;
  }

  const formatClasses = {
    banner: "min-h-[90px] max-w-[728px]", // Standard banner (728x90)
    rectangle: "min-h-[250px] max-w-[300px]", // Medium rectangle (300x250)
    leaderboard: "min-h-[90px] max-w-[970px]", // Leaderboard (970x90)
    sidebar: "min-h-[600px] max-w-[160px]", // Wide skyscraper (160x600)
  };

  return (
    <div
      ref={adRef}
      id={placementId}
      className={`ad-container mx-auto ${formatClasses[format]} ${className}`}
      data-ad-format={format}
    >
      {/* Ezoic will inject ad here */}
    </div>
  );
};

// TypeScript declaration for Ezoic global
declare global {
  interface Window {
    ezstandalone?: {
      define: (placementId: string) => void;
      display: () => void;
      refresh: () => void;
    };
  }
}

export default AdBanner;
