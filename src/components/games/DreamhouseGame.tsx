import { useEffect } from "react";

interface DreamhouseGameProps {
  onBack: () => void;
}

export const DreamhouseGame = ({ onBack }: DreamhouseGameProps) => {
  useEffect(() => {
    window.open("https://poki.com/en/g/barbie-dreamhouse-adventures", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
