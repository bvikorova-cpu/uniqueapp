export const CATEGORY_TEASERS = {
  wall: {
    label: "Social Wall",
    hook: "CREATE. CONNECT. EARN.",
    lines: ["Share posts, stories and reels", "Grow smarter with AI tools", "Receive gifts with real cash value"],
    outro: "Your audience is waiting.",
    accent: "#ff3ea5",
  },
  messenger: {
    label: "Messenger",
    hook: "CLOSER. EVERY DAY.",
    lines: ["Private chats that feel personal", "Share moments, gifts and reactions", "Keep every connection in one place"],
    outro: "Start the conversation.",
    accent: "#8b5cf6",
  },
  games: {
    label: "Games",
    hook: "PLAY. COMPETE. WIN.",
    lines: ["Discover games for every mood", "Challenge friends and climb higher", "Turn every round into a new adventure"],
    outro: "Your next game starts here.",
    accent: "#36d6c3",
  },
  jobs: {
    label: "Jobs",
    hook: "TALENT MEETS OPPORTUNITY.",
    lines: ["Find work that fits your skills", "Connect directly with real people", "Build income on your own terms"],
    outro: "Make your next move.",
    accent: "#ff855c",
  },
  rewards: {
    label: "Rewards",
    hook: "EVERY ACTION COUNTS.",
    lines: ["Earn XP for being active", "Unlock badges and milestones", "Collect rewards as you grow"],
    outro: "Your progress deserves more.",
    accent: "#f5c84c",
  },
  promotions: {
    label: "Promotions",
    hook: "BE SEEN. GROW FASTER.",
    lines: ["Put your offer in the spotlight", "Reach people across Unique", "Choose the promotion that fits you"],
    outro: "Turn attention into growth.",
    accent: "#ff567f",
  },
  megatalent: {
    label: "Megatalent",
    hook: "YOUR TALENT. YOUR STAGE.",
    lines: ["Share your performance", "Let the community vote", "Compete for the quarterly prize"],
    outro: "This could be your moment.",
    accent: "#d7a83b",
  },
} as const;

export type CategoryTeaserId = keyof typeof CATEGORY_TEASERS;
