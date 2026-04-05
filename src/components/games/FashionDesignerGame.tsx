import { useEffect } from "react";

interface FashionDesignerGameProps {
  onBack: () => void;
}

export const FashionDesignerGame = ({ onBack }: FashionDesignerGameProps) => {
  useEffect(() => {
    window.open("https://poki.com/en/g/fashion-battle-dress-up", "_blank");
    onBack();
  }, [onBack]);

  return null;
};
