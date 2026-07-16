// 10 marketing video versions. Each shares 8 scene slots, but with unique
// captions, palette and image set. Images live in public/images/marketing/vN/.

export type VScene = { caption: string; image: string };
export type Version = {
  id: string;
  tone: "inspirational" | "playful" | "direct" | "editorial";
  palette: {
    bg: string;
    textColor: string;
    accent: string; // for wordmark gradient
    accent2: string;
    outroTint: string;
    captionShadow: string;
  };
  display: "Playfair Display" | "Bebas Neue" | "Bungee" | "Fredoka" | "DM Serif Display" | "Anton" | "Righteous" | "Cormorant Garamond" | "Space Grotesk" | "Lobster";
  captionWeight: 700 | 800 | 900;
  captionSize: number; // px
  scenes: VScene[]; // exactly 8
};

// Every version uses 8 scenes × 112 frames = 896 frames (~29.9s @30fps).
// We render 900 to give the outro a little breathing room.

export const VERSIONS: Version[] = [
  {
    id: "v1-dream-bigger",
    tone: "inspirational",
    display: "Playfair Display",
    captionWeight: 900,
    captionSize: 108,
    palette: {
      bg: "#1a0f08",
      textColor: "#fff7ec",
      accent: "#ffb547",
      accent2: "#ff6a3d",
      outroTint: "rgba(20,10,4,0.35)",
      captionShadow: "0 8px 40px rgba(0,0,0,0.75)",
    },
    scenes: [
      { caption: "Dream bigger", image: "01.jpg" },
      { caption: "Live louder", image: "02.jpg" },
      { caption: "Share the moment", image: "03.jpg" },
      { caption: "Find your people", image: "04.jpg" },
      { caption: "Grow your talent", image: "05.jpg" },
      { caption: "Create without limits", image: "06.jpg" },
      { caption: "One world.\nOne app.", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v2-your-world",
    tone: "playful",
    display: "Bungee",
    captionWeight: 800,
    captionSize: 104,
    palette: {
      bg: "#0d0026",
      textColor: "#ffffff",
      accent: "#ff2fd6",
      accent2: "#00e5ff",
      outroTint: "rgba(15,0,40,0.35)",
      captionShadow: "0 0 30px rgba(255,47,214,0.55), 0 6px 20px rgba(0,0,0,0.7)",
    },
    scenes: [
      { caption: "Your world", image: "01.jpg" },
      { caption: "Your rules", image: "02.jpg" },
      { caption: "Post it loud", image: "03.jpg" },
      { caption: "Match. Vibe. Repeat.", image: "04.jpg" },
      { caption: "Show your talent", image: "05.jpg" },
      { caption: "Play. Earn. Level up.", image: "06.jpg" },
      { caption: "Made for you", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v3-everything-in-one",
    tone: "direct",
    display: "Space Grotesk",
    captionWeight: 700,
    captionSize: 100,
    palette: {
      bg: "#050912",
      textColor: "#ffffff",
      accent: "#4d9dff",
      accent2: "#7cffcb",
      outroTint: "rgba(5,10,20,0.4)",
      captionShadow: "0 4px 24px rgba(0,0,0,0.7)",
    },
    scenes: [
      { caption: "Everything.\nOne app.", image: "01.jpg" },
      { caption: "Post", image: "02.jpg" },
      { caption: "Match", image: "03.jpg" },
      { caption: "Learn", image: "04.jpg" },
      { caption: "Earn", image: "05.jpg" },
      { caption: "Create with AI", image: "06.jpg" },
      { caption: "Powered by you", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v4-art-of-you",
    tone: "editorial",
    display: "Cormorant Garamond",
    captionWeight: 700,
    captionSize: 118,
    palette: {
      bg: "#0f0d0a",
      textColor: "#f4ecd8",
      accent: "#d4af6a",
      accent2: "#fff2c9",
      outroTint: "rgba(15,13,10,0.35)",
      captionShadow: "0 6px 30px rgba(0,0,0,0.7)",
    },
    scenes: [
      { caption: "The art of you", image: "01.jpg" },
      { caption: "A quiet stage", image: "02.jpg" },
      { caption: "A louder voice", image: "03.jpg" },
      { caption: "A softer connection", image: "04.jpg" },
      { caption: "A bolder self", image: "05.jpg" },
      { caption: "Where you become\nUnique", image: "06.jpg" },
      { caption: "Curated. Human.", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v5-one-life",
    tone: "inspirational",
    display: "Bebas Neue",
    captionWeight: 800,
    captionSize: 140,
    palette: {
      bg: "#02060a",
      textColor: "#ffffff",
      accent: "#ff8a3d",
      accent2: "#38d1ff",
      outroTint: "rgba(2,6,10,0.35)",
      captionShadow: "0 8px 40px rgba(0,0,0,0.8)",
    },
    scenes: [
      { caption: "One life", image: "01.jpg" },
      { caption: "One app", image: "02.jpg" },
      { caption: "Endless\nstories", image: "03.jpg" },
      { caption: "Endless\nconnections", image: "04.jpg" },
      { caption: "Endless\ncreation", image: "05.jpg" },
      { caption: "Endless\nyou", image: "06.jpg" },
      { caption: "Live it all", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v6-little-sparks",
    tone: "playful",
    display: "Fredoka",
    captionWeight: 700,
    captionSize: 100,
    palette: {
      bg: "#2b0a3d",
      textColor: "#ffffff",
      accent: "#ffb1d8",
      accent2: "#b57bff",
      outroTint: "rgba(43,10,61,0.35)",
      captionShadow: "0 6px 24px rgba(0,0,0,0.6)",
    },
    scenes: [
      { caption: "Little sparks", image: "01.jpg" },
      { caption: "Big dreams", image: "02.jpg" },
      { caption: "Tiny wins.\nEvery day.", image: "03.jpg" },
      { caption: "Kids create.\nSafely.", image: "04.jpg" },
      { caption: "Grown-ups\nplay too", image: "05.jpg" },
      { caption: "Friends turn\ninto family", image: "06.jpg" },
      { caption: "Everyone's welcome", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v7-post-match-earn",
    tone: "direct",
    display: "Anton",
    captionWeight: 800,
    captionSize: 160,
    palette: {
      bg: "#000000",
      textColor: "#ffffff",
      accent: "#39ff88",
      accent2: "#ffffff",
      outroTint: "rgba(0,0,0,0.45)",
      captionShadow: "0 6px 24px rgba(0,0,0,0.8)",
    },
    scenes: [
      { caption: "POST.", image: "01.jpg" },
      { caption: "MATCH.", image: "02.jpg" },
      { caption: "LEARN.", image: "03.jpg" },
      { caption: "EARN.", image: "04.jpg" },
      { caption: "CREATE.", image: "05.jpg" },
      { caption: "REPEAT.", image: "06.jpg" },
      { caption: "ONE APP.", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v8-become-unique",
    tone: "editorial",
    display: "DM Serif Display",
    captionWeight: 700,
    captionSize: 116,
    palette: {
      bg: "#0a0a0a",
      textColor: "#ffffff",
      accent: "#ff3b3b",
      accent2: "#ffffff",
      outroTint: "rgba(10,10,10,0.4)",
      captionShadow: "0 6px 26px rgba(0,0,0,0.75)",
    },
    scenes: [
      { caption: "Not another app", image: "01.jpg" },
      { caption: "A place to be seen", image: "02.jpg" },
      { caption: "A place to be heard", image: "03.jpg" },
      { caption: "A place to grow", image: "04.jpg" },
      { caption: "A place to belong", image: "05.jpg" },
      { caption: "A place to be you", image: "06.jpg" },
      { caption: "Become Unique", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v9-rewrite-possible",
    tone: "inspirational",
    display: "Righteous",
    captionWeight: 700,
    captionSize: 108,
    palette: {
      bg: "#03051a",
      textColor: "#ffffff",
      accent: "#7cf9ff",
      accent2: "#c58bff",
      outroTint: "rgba(3,5,26,0.4)",
      captionShadow: "0 0 24px rgba(124,249,255,0.35), 0 6px 20px rgba(0,0,0,0.75)",
    },
    scenes: [
      { caption: "Rewrite possible", image: "01.jpg" },
      { caption: "Speak up", image: "02.jpg" },
      { caption: "Show up", image: "03.jpg" },
      { caption: "Level up", image: "04.jpg" },
      { caption: "Cash in\nyour talent", image: "05.jpg" },
      { caption: "AI in your pocket", image: "06.jpg" },
      { caption: "The future is\nUnique", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
  {
    id: "v10-feel-alive",
    tone: "playful",
    display: "Lobster",
    captionWeight: 700,
    captionSize: 118,
    palette: {
      bg: "#1a0022",
      textColor: "#ffffff",
      accent: "#ff5fa2",
      accent2: "#ffd166",
      outroTint: "rgba(26,0,34,0.35)",
      captionShadow: "0 6px 30px rgba(0,0,0,0.65)",
    },
    scenes: [
      { caption: "Feel alive again", image: "01.jpg" },
      { caption: "Dance in the DMs", image: "02.jpg" },
      { caption: "Fall a little\nin love", image: "03.jpg" },
      { caption: "Sing loud", image: "04.jpg" },
      { caption: "Laugh with\nstrangers", image: "05.jpg" },
      { caption: "Chase what you love", image: "06.jpg" },
      { caption: "Life's more fun\nhere", image: "07.jpg" },
      { caption: "Unique", image: "08.jpg" },
    ],
  },
];
