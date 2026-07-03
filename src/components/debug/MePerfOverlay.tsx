import { useEffect, useState } from "react";
import {
  getMeSnapshot,
  isPerfEnabled,
  subscribeMe,
} from "@/utils/perfMe";

/**
 * Tiny fixed overlay showing profile-page load metrics on mobile.
 * Only rendered when perf mode is enabled (?perf=1 or localStorage flag).
 */
export const MePerfOverlay = () => {
  const [, tick] = useState(0);
  const enabled = isPerfEnabled();

  useEffect(() => {
    if (!enabled) return;
    return subscribeMe(() => tick((n) => n + 1));
  }, [enabled]);

  if (!enabled) return null;

  const snap = getMeSnapshot();
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const elapsed = snap.traceStart ? Math.round(now - snap.traceStart) : 0;
  const firstPaint = snap.firstPaintAt
    ? Math.round(snap.firstPaintAt - snap.traceStart)
    : null;

  return (
    <div
      className="fixed bottom-20 right-2 z-[60] max-w-[220px] rounded-lg border border-primary/40 bg-background/95 p-2 font-mono text-[10px] leading-tight shadow-lg backdrop-blur"
      aria-live="polite"
    >
      <div className="mb-1 font-semibold text-primary">PerfMe</div>
      <div>elapsed: {elapsed}ms</div>
      <div>1st paint: {firstPaint !== null ? `${firstPaint}ms` : "…"}</div>
      <div>queries: {snap.queryCount}</div>
      {snap.samples.length > 0 && (
        <div className="mt-1 border-t border-border/60 pt-1">
          {snap.samples.slice(-6).map((s, i) => (
            <div key={i} className={s.ok ? "" : "text-destructive"}>
              {Math.round(s.ms)}ms · {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MePerfOverlay;
