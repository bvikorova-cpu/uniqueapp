/**
 * Wall feed performance tracer.
 *
 * Measures:
 * - TTFP  — time to first paint (first non-empty feedItems render)
 * - TTI   — time to interactive (first fetch complete + first paint done)
 * - RPCs  — count of Supabase RPC/table calls tied to feed load
 * - Cache hit — whether initial paint came from localStorage cache
 *
 * Always logs a summary to console with the `[WallPerf]` tag. Zero cost
 * beyond a few timestamps + counters.
 */

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

type RpcSample = { label: string; ms: number; ok: boolean };

let mountAt = 0;
let firstPaintAt = 0;
let interactiveAt = 0;
let rpcCount = 0;
let rpcSamples: RpcSample[] = [];
let cacheHit = false;
let reported = false;

export function startWallTrace(opts: { cacheHit: boolean }) {
  mountAt = now();
  firstPaintAt = 0;
  interactiveAt = 0;
  rpcCount = 0;
  rpcSamples = [];
  cacheHit = opts.cacheHit;
  reported = false;
  // eslint-disable-next-line no-console
  console.log("[WallPerf] start", { cacheHit });
}

export function markWallFirstPaint() {
  if (firstPaintAt !== 0 || mountAt === 0) return;
  firstPaintAt = now();
  // eslint-disable-next-line no-console
  console.log("[WallPerf] first-paint", {
    ms: Math.round(firstPaintAt - mountAt),
    cacheHit,
  });
  maybeReport();
}

export function markWallInteractive() {
  if (interactiveAt !== 0 || mountAt === 0) return;
  interactiveAt = now();
  // eslint-disable-next-line no-console
  console.log("[WallPerf] interactive", {
    ms: Math.round(interactiveAt - mountAt),
    rpcCount,
  });
  maybeReport();
}

export async function tracedRpc<T>(
  label: string,
  run: () => PromiseLike<T>,
): Promise<T> {
  rpcCount += 1;
  const startedAt = now();
  try {
    const result = await run();
    const ms = now() - startedAt;
    const ok =
      typeof result === "object" && result !== null && "error" in result
        ? !(result as { error: unknown }).error
        : true;
    rpcSamples.push({ label, ms, ok });
    // eslint-disable-next-line no-console
    console.log(`[WallPerf] rpc ${label}`, { ms: Math.round(ms), ok });
    return result;
  } catch (err) {
    const ms = now() - startedAt;
    rpcSamples.push({ label, ms, ok: false });
    throw err;
  }
}

function maybeReport() {
  if (reported) return;
  if (!firstPaintAt || !interactiveAt) return;
  reported = true;
  const summary = {
    cacheHit,
    ttfpMs: Math.round(firstPaintAt - mountAt),
    ttiMs: Math.round(interactiveAt - mountAt),
    rpcCount,
    slowestRpc: [...rpcSamples]
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 5)
      .map((s) => ({ label: s.label, ms: Math.round(s.ms), ok: s.ok })),
  };
  // eslint-disable-next-line no-console
  console.log("[WallPerf] report", summary);
}
