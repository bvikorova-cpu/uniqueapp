import { useEffect } from "react";

interface PokiGameWrapperProps {
  slug: string;
  title: string;
  onBack?: () => void;
}

export const PokiGameWrapper = ({ slug, title, onBack }: PokiGameWrapperProps) => {
  useEffect(() => {
    // Open Poki game in new tab and go back
    window.open(`https://poki.com/en/g/${slug}`, "_blank");
    onBack?.();
  }, [slug, onBack]);

  return null;
};
