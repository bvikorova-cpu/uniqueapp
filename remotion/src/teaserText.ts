export type TeaserLang = "en" | "sk";

export type TeaserCardText = { title: string; items: string[] };

export type TeaserCopy = {
  intro: { tagline: string };
  cards: TeaserCardText[];
  outro: { cta: string };
  voice: string;
  extraFrames: number;
};

export const TEASER_COPY: Record<TeaserLang, TeaserCopy> = {
  en: {
    intro: { tagline: "Welcome — one app, endless ways to earn" },
    cards: [
      { title: "Social Wall", items: ["Posts, stories & reels", "AI viral predictor"] },
      { title: "AI Studio", items: ["Photo, video & content tools", "Smart assistants"] },
      { title: "Learn, Play & Meet", items: ["Courses, kids hub, games", "Dating & friends"] },
      { title: "Earn Real Euros", items: ["Gifts • 50% payout", "Marketplace, skills, courses"] },
    ],
    outro: { cta: "Join today and start earning" },
    voice: "teaser-voice/en.mp3",
    extraFrames: 0,
  },
  sk: {
    intro: { tagline: "Vitaj — jedna apka, veľa možností zarobiť" },
    cards: [
      { title: "Sociálna stena", items: ["Príspevky, stories a reels", "AI predikcia virality"] },
      { title: "AI štúdio", items: ["Foto, video a obsah", "Inteligentní asistenti"] },
      { title: "Uč sa, hraj, spoznávaj", items: ["Kurzy, detský hub, hry", "Randenie a priatelia"] },
      { title: "Zarábaj reálne eurá", items: ["Darčeky • 50 % výplata", "Bazár, služby, kurzy"] },
    ],
    outro: { cta: "Pripoj sa dnes a začni zarábať" },
    voice: "teaser-voice/sk.mp3",
    extraFrames: 45,
  },
};
