import type { EscapeUserStats } from "@/hooks/useEscapeRoomRealStats";

export interface EscapeBadge {
  name: string;
  desc: string;
  icon: string;
  xp: number;
  earned: boolean;
  progress: number;
}

const pct = (value: number, target: number) =>
  Math.max(0, Math.min(100, Math.round((value / target) * 100)));

/** Derives badge state purely from real user session data. */
export function computeEscapeBadges(s: EscapeUserStats): EscapeBadge[] {
  const themeCount = (t: string) => s.themesCompleted[t] || 0;

  const defs: Array<Omit<EscapeBadge, "earned" | "progress"> & { value: number; target: number }> = [
    { name: "First Escape", desc: "Complete your first room", icon: "🔓", xp: 50, value: s.completed, target: 1 },
    { name: "Speed Demon", desc: "Complete a room under 20 minutes", icon: "⚡", xp: 100, value: s.under20Runs, target: 1 },
    { name: "Hint-Free", desc: "Complete a room without any hints", icon: "🧠", xp: 150, value: s.hintFreeRuns, target: 1 },
    { name: "Explorer", desc: "Complete 5 different rooms", icon: "🧭", xp: 75, value: s.completed, target: 5 },
    { name: "Horror Master", desc: "Complete 3 horror rooms", icon: "👻", xp: 200, value: themeCount("horror"), target: 3 },
    { name: "Mystery Maven", desc: "Complete 3 mystery rooms", icon: "🔍", xp: 200, value: themeCount("mystery"), target: 3 },
    { name: "Room Creator", desc: "Create and publish 5 rooms", icon: "🏗️", xp: 250, value: s.createdRooms, target: 5 },
    { name: "Perfectionist", desc: "Score 950+ on any room", icon: "💎", xp: 300, value: s.bestScore, target: 950 },
    { name: "Marathon Runner", desc: "Play 3 rooms in one day", icon: "🏃", xp: 200, value: s.roomsToday, target: 3 },
    { name: "Legend", desc: "Reach 10,000 total XP", icon: "🏆", xp: 500, value: s.totalXp, target: 10000 },
  ];

  return defs.map(({ value, target, ...rest }) => ({
    ...rest,
    earned: value >= target,
    progress: pct(value, target),
  }));
}
