import { useEffect } from "react";

interface GlitterMakeupGameProps {
  onBack: () => void;
}

export const GlitterMakeupGame = ({ onBack }: GlitterMakeupGameProps) => {
  useEffect(() => {
    window.open("https://poki.com/en/g/makeup-salon", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
