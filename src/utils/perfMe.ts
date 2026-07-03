/**
 * Lightweight performance tracer for the "Me" (profile) navigation.
 *
 * How to use:
 * - Call markMeClick() when the user taps the "Me" tab.
 * - Call startMeTrace() at the top of the Profile page effect.
 * - Wrap Supabase calls with tracedQuery("label", () => supabase.from(...)...).
 * - Call markMeFirstPaint() when the profile shell first renders.
 * - Call finishMeTrace() when all critical queries complete.
 *
 * Enable overlay by adding ?perf=1 to the URL or
 * localStorage.setItem("perf:me","1"). Metrics are always console.logged
 * with the [PerfMe] tag so you can inspect them from remote devices too.
 */

const CLICK_KEY = "perf:me:clickAt";
const ENABLE_KEY = "perf:me";
const SNAPSHOT_KEY = "perf:me:profileSnapshot";

type Sample = {
  label: string;
  ms: number;
  ok: boolean;
};

let traceStart = 0;
let firstPaintAt = 0;
let samples: Sample[] = [];
let queryCount = 0;
let subscribers: Array<() => void> = [];

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export const isPerfEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("perf") === "1")
      return true;
    return window.localStorage.getItem(ENABLE_KEY) === "1";
  } catch {
    return false;
  }
};

export const markMeClick = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CLICK_KEY, String(now()));
  } catch {
    /* ignore */
  }
};

type SessionUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type MeProfileSnapshot = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  savedAt: number;
};

export const storeMeProfileSnapshot = (user: SessionUserLike | null | undefined) => {
  if (typeof window === "undefined" || !user?.id) return;
  try {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.email?.split("@")[0] ?? "Unique user");
    const snapshot: MeProfileSnapshot = {
      id: user.id,
      full_name: fullName,
      avatar_url: (user.user_metadata?.avatar_url as string | undefined) || null,
      email: user.email ?? null,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
};

export const readMeProfileSnapshot = (userId: string | undefined): MeProfileSnapshot | null => {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.sessionStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw) as MeProfileSnapshot;
    if (snapshot.id !== userId) return null;
    if (Date.now() - snapshot.savedAt > 15 * 60 * 1000) return null;
    return snapshot;
  } catch {
    return null;
  }
};

const readClickAt = (): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CLICK_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

export const startMeTrace = () => {
  traceStart = now();
  firstPaintAt = 0;
  samples = [];
  queryCount = 0;
  notify();
};

export const markMeFirstPaint = () => {
  if (firstPaintAt !== 0) return;
  firstPaintAt = now();
  const clickAt = readClickAt();
  const sinceClick = clickAt ? firstPaintAt - clickAt : null;
  const sinceMount = traceStart ? firstPaintAt - traceStart : null;
  // eslint-disable-next-line no-console
  console.log(
    "[PerfMe] first-paint",
    JSON.stringify({
      sinceClickMs: sinceClick !== null ? Math.round(sinceClick) : null,
      sinceMountMs: sinceMount !== null ? Math.round(sinceMount) : null,
    }),
  );
  try {
    window.sessionStorage.removeItem(CLICK_KEY);
  } catch {
    /* ignore */
  }
  notify();
};

export const tracedQuery = async <T>(
  label: string,
  run: () => PromiseLike<T>,
): Promise<T> => {
  queryCount += 1;
  const startedAt = now();
  try {
    const result = await run();
    const ms = now() - startedAt;
    const ok =
      typeof result === "object" && result !== null && "error" in result
        ? !(result as { error: unknown }).error
        : true;
    samples.push({ label, ms, ok });
    if (isPerfEnabled()) {
      // eslint-disable-next-line no-console
      console.log(`[PerfMe] query ${label}`, {
        ms: Math.round(ms),
        ok,
      });
    }
    notify();
    return result;
  } catch (err) {
    const ms = now() - startedAt;
    samples.push({ label, ms, ok: false });
    notify();
    throw err;
  }
};

export const finishMeTrace = () => {
  const total = traceStart ? now() - traceStart : 0;
  const clickAt = readClickAt();
  const summary = {
    totalMs: Math.round(total),
    firstPaintMs: firstPaintAt
      ? Math.round(firstPaintAt - traceStart)
      : null,
    sinceClickMs: clickAt ? Math.round(now() - clickAt) : null,
    queries: queryCount,
    slowest: [...samples]
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)
      .map((s) => ({ label: s.label, ms: Math.round(s.ms), ok: s.ok })),
  };
  // eslint-disable-next-line no-console
  console.log("[PerfMe] done", summary);
  notify();
};

export const getMeSnapshot = () => ({
  traceStart,
  firstPaintAt,
  queryCount,
  samples: [...samples],
});

export const subscribeMe = (cb: () => void) => {
  subscribers.push(cb);
  return () => {
    subscribers = subscribers.filter((s) => s !== cb);
  };
};

const notify = () => {
  for (const cb of subscribers) cb();
};
