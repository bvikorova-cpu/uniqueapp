export type TvLang = "sk" | "en";

export interface TvScene {
  /** Big headline on screen. */
  title: string;
  /** One short supporting line. */
  line: string;
}

export interface TvCopy {
  claim: string;
  tagline: string;
  scenes: TvScene[];
  cta: string;
  ctaSub: string;
  voice: string;
}

export const TV_COPY: Record<TvLang, TvCopy> = {
  en: {
    claim: "Unique",
    tagline: "One app. Your whole world.",
    scenes: [
      { title: "Meet people", line: "Wall, videos, messenger, dating and real friendships" },
      { title: "Create with AI", line: "Photos, videos, flyers and voices in seconds" },
      { title: "Earn every day", line: "Gifts, courses, marketplace and rewards" },
      { title: "Learn and play", line: "Courses, quizzes, arenas and safe kids channel" },
      { title: "Win together", line: "Megatalent prize, charity share and referrals" },
    ],
    cta: "uniqueapp.fun",
    ctaSub: "Install Unique today. No app store needed.",
    voice: "tvspot-voice/en.mp3",
  },
  sk: {
    claim: "Unique",
    tagline: "Jedna aplikácia. Celý tvoj svet.",
    scenes: [
      { title: "Spoznávaj ľudí", line: "Wall, videá, messenger, dating a skutočné priateľstvá" },
      { title: "Tvor s umelou inteligenciou", line: "Fotky, videá, letáky a hlasy v priebehu sekúnd" },
      { title: "Zarábaj každý deň", line: "Darčeky, kurzy, trhoviská a odmeny" },
      { title: "Uč sa a hraj", line: "Kurzy, kvízy, arény a bezpečný detský kanál" },
      { title: "Vyhrávajte spolu", line: "Megatalent výhra, podiel na charitu a odporúčania" },
    ],
    cta: "uniqueapp.fun",
    ctaSub: "Nainštaluj si Unique ešte dnes. Bez app storu.",
    voice: "tvspot-voice/sk.mp3",
  },
};
