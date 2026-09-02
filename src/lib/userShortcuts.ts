// Personal "For you" shortcuts stored per user in localStorage.
// Populated by the welcome onboarding (interests) and editable from the navbar.

export type Shortcut = { path: string; label: string; emoji?: string };

const KEY_PREFIX = "unique_shortcuts_v1";
const EVENT = "unique-shortcuts-changed";
export const MAX_SHORTCUTS = 8;

const keyFor = (userId?: string | null) =>
  `${KEY_PREFIX}_${userId || "guest"}`;

export function getShortcuts(userId?: string | null): Shortcut[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s.path === "string" && typeof s.label === "string")
      .slice(0, MAX_SHORTCUTS);
  } catch {
    return [];
  }
}

export function setShortcuts(userId: string | null | undefined, items: Shortcut[]) {
  try {
    localStorage.setItem(
      keyFor(userId),
      JSON.stringify(items.slice(0, MAX_SHORTCUTS)),
    );
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addShortcuts(userId: string | null | undefined, items: Shortcut[]) {
  const current = getShortcuts(userId);
  const seen = new Set(current.map((s) => s.path));
  const merged = [...current];
  for (const item of items) {
    if (seen.has(item.path)) continue;
    seen.add(item.path);
    merged.push(item);
  }
  setShortcuts(userId, merged);
}

export function toggleShortcut(userId: string | null | undefined, item: Shortcut) {
  const current = getShortcuts(userId);
  const exists = current.some((s) => s.path === item.path);
  const next = exists
    ? current.filter((s) => s.path !== item.path)
    : [...current, item];
  setShortcuts(userId, next);
  return !exists;
}

export function removeShortcut(userId: string | null | undefined, path: string) {
  setShortcuts(
    userId,
    getShortcuts(userId).filter((s) => s.path !== path),
  );
}

export function subscribeShortcuts(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
