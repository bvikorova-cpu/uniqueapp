// Unified Kids Academy economy.
// XP is the canonical earned currency (never decreases).
// Stars = spendable currency derived from XP: 1 star per 10 XP, minus spent stars.

const XP_KEY = "kids-academy-xp";
const SPENT_KEY = "kids-academy-stars-spent";
const STARS_PER_XP_DIVISOR = 10;

export function getXP(): number {
  return parseInt(localStorage.getItem(XP_KEY) || "0", 10) || 0;
}

export function addXP(amount: number): number {
  const next = getXP() + amount;
  localStorage.setItem(XP_KEY, String(next));
  window.dispatchEvent(new StorageEvent("storage", { key: XP_KEY }));
  return next;
}

export function getStarsSpent(): number {
  return parseInt(localStorage.getItem(SPENT_KEY) || "0", 10) || 0;
}

export function getStars(): number {
  return Math.max(0, Math.floor(getXP() / STARS_PER_XP_DIVISOR) - getStarsSpent());
}

export function spendStars(amount: number): boolean {
  if (getStars() < amount) return false;
  localStorage.setItem(SPENT_KEY, String(getStarsSpent() + amount));
  window.dispatchEvent(new StorageEvent("storage", { key: SPENT_KEY }));
  return true;
}

// Track which modules the child has visited (from Adventure Map).
const MODULES_KEY = "kids-academy-modules-visited";
export function recordModuleVisit(moduleId: string) {
  const data = JSON.parse(localStorage.getItem(MODULES_KEY) || "{}") as Record<string, number>;
  data[moduleId] = (data[moduleId] || 0) + 1;
  localStorage.setItem(MODULES_KEY, JSON.stringify(data));
  window.dispatchEvent(new StorageEvent("storage", { key: MODULES_KEY }));
}
export function getModuleVisits(): Record<string, number> {
  return JSON.parse(localStorage.getItem(MODULES_KEY) || "{}");
}

// Friend challenges
const FRIEND_KEY = "kids-academy-friend-challenges";
export type FriendChallenge = {
  id: string;
  friendName: string;
  category: string;
  createdAt: number;
  status: "pending" | "completed";
};
export function getFriendChallenges(): FriendChallenge[] {
  return JSON.parse(localStorage.getItem(FRIEND_KEY) || "[]");
}
export function addFriendChallenge(c: Omit<FriendChallenge, "id" | "createdAt" | "status">): FriendChallenge {
  const newChallenge: FriendChallenge = {
    ...c,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    status: "pending",
  };
  const list = getFriendChallenges();
  list.unshift(newChallenge);
  localStorage.setItem(FRIEND_KEY, JSON.stringify(list));
  return newChallenge;
}
