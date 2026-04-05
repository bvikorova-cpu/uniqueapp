import { useEffect } from "react";

interface EmbeddedGameProps {
  onBack: () => void;
  title: string;
  gameUrl: string;
  sport: "football" | "basketball" | "hockey" | "tennis" | "american-football";
}

// Poki slugs for each sport — guaranteed to work in a new tab
const pokiSlugs: Record<string, string> = {
  football: "football-legends",
  basketball: "basketball-stars",
  hockey: "hockey-legends",
  tennis: "tennis-masters",
  "american-football": "touchdown-rush",
};

export const EmbeddedGame = ({ onBack, title, gameUrl, sport }: EmbeddedGameProps) => {
  useEffect(() => {
    const slug = pokiSlugs[sport] || "football-legends";
    window.open(`https://poki.com/en/g/${slug}`, "_blank");
    onBack();
  }, [sport, onBack]);

  return null;
};
