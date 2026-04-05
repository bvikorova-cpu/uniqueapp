import { useEffect } from "react";

interface GlamourPokiGameProps {
  onBack: () => void;
  slug: string;
}

export function GlamourPokiGame({ onBack, slug }: GlamourPokiGameProps) {
  useEffect(() => {
    window.open(`https://poki.com/en/g/${slug}`, "_blank");
    onBack();
  }, [slug, onBack]);

  return null;
}
