import { useEffect } from "react";

interface MorningMayhemGameProps {
  onBack: () => void;
}

export const MorningMayhemGame = ({ onBack }: MorningMayhemGameProps) => {
  useEffect(() => {
    window.open("https://poki.com/en/g/morning-catch", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
