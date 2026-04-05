import { useEffect } from "react";

interface BarbieGameProps {
  onBack: () => void;
}

export const BarbieGame = ({ onBack }: BarbieGameProps) => {
  useEffect(() => {
    window.open("https://poki.com/en/g/barbie-dreamhouse-adventures", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
