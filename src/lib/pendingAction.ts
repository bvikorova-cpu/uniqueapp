/**
 * Universal "pending action" store — persists a user's intent across the
 * /auth redirect so AI tool flows don't lose state after sign-in.
 *
 * Usage:
 *   savePendingAction({ key: "ai-tattoo:generate", data: { prompt }, returnTo: "/ai-tattoo" });
 *   navigate("/auth");
 *
 * Then on the target page after auth:
 *   const pending = consumePendingAction("ai-tattoo:generate");
 *   if (pending) runGeneration(pending.data);
 */
const STORAGE_KEY = "lovable.pendingAction.v1";
const TTL_MS = 30 * 60 * 1000; // 30 min

export interface PendingAction<T = any> {
  key: string;
  data?: T;
  returnTo?: string;
  savedAt: number;
}

export function savePendingAction<T = any>(payload: Omit<PendingAction<T>, "savedAt">) {
  try {
    const full: PendingAction<T> = { ...payload, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    if (payload.returnTo) {
      localStorage.setItem(STORAGE_KEY + ":returnTo", payload.returnTo);
    }
  } catch {
    /* ignore quota errors */
  }
}

export function peekPendingAction<T = any>(): PendingAction<T> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAction<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      clearPendingAction();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function consumePendingAction<T = any>(expectedKey?: string): PendingAction<T> | null {
  const p = peekPendingAction<T>();
  if (!p) return null;
  if (expectedKey && p.key !== expectedKey) return null;
  clearPendingAction();
  return p;
}

export function clearPendingAction() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + ":returnTo");
  } catch {
    /* noop */
  }
}

export function getPendingReturnTo(): string | null {
  return peekPendingAction()?.returnTo ?? null;
}
