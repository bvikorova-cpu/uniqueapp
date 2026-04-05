import { useEffect } from "react";

interface GameDistributionWrapperProps {
  gameId: string;
  title: string;
  width?: number;
  height?: number;
  onBack: () => void;
}

export const GameDistributionWrapper = ({ 
  gameId, 
  title, 
  onBack 
}: GameDistributionWrapperProps) => {
  useEffect(() => {
    // GameDistribution iframes are blocked by security headers
    // Redirect to Poki instead
    window.open("https://poki.com/en/", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
