/**
 * Real-user Web Vitals reporter.
 *
 * Subscribes to LCP / CLS / INP / FCP / TTFB and ships them to the
 * `vitals-ingest` edge function via `navigator.sendBeacon` (with a fetch
 * fallback for browsers that block beacons). Samples are batched per
 * page-lifecycle event so we never block the main thread or cause an
 * extra request on hot paths.
 *
 * Sampling: 100% of sessions today — flip `SAMPLE_RATE` below if traffic
 * grows past ~50 req/min on the ingest endpoint.
 */

import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from "web-vitals";

// Reduced from 1.0 → 0.1 to prevent vitals_log INSERT pressure at scale
// (was ~14k inserts/day causing 388s total DB time, max 7.2s).
const SAMPLE_RATE = 0.1; // 0..1 — sample 10% of sessions
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vitals-ingest`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Sample = {
  metric: string;
  value: number;
  rating?: string;
  navigation_type?: string;
  route?: string;
  device?: string;
  connection?: string;
  session_id?: string;
};

let queue: Sample[] = [];
let installed = false;
let sessionId = "";

function getSessionId(): string {
  if (sessionId) return sessionId;
  try {
    const k = "wv_session";
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(k, v);
    }
    sessionId = v;
  } catch {
    sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return sessionId;
}

function detectDevice(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function detectConnection(): string | undefined {
  // Network Information API — Chromium only.
  const c = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  return c?.effectiveType;
}

function flush() {
  if (queue.length === 0) return;
  const body = JSON.stringify({ samples: queue });
  queue = [];

  const headers = { "Content-Type": "application/json", apikey: ANON_KEY };
  // Beacon ignores custom headers, so we POST via fetch with `keepalive` to
  // get auth headers + survive page unload.
  try {
    fetch(ENDPOINT, { method: "POST", body, headers, keepalive: true }).catch(() => {});
  } catch {
    // last-ditch beacon — anon ingest still works without apikey for some configs
    try {
      navigator.sendBeacon?.(ENDPOINT, body);
    } catch {
      /* swallow */
    }
  }
}

function handleMetric(m: Metric) {
  queue.push({
    metric: m.name,
    value: Number(m.value.toFixed(4)),
    rating: m.rating,
    navigation_type: m.navigationType,
    route: location.pathname,
    device: detectDevice(),
    connection: detectConnection(),
    session_id: getSessionId(),
  });
  // Flush opportunistically when we have a few samples, to avoid losing
  // them if the user navigates away.
  if (queue.length >= 3) flush();
}

export function installWebVitals() {
  if (installed || typeof window === "undefined") return;
  if (Math.random() > SAMPLE_RATE) return;
  installed = true;

  onLCP(handleMetric);
  onCLS(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);

  // Flush on tab hide / unload — vitals (esp. CLS, INP) finalize at unload.
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  addEventListener("pagehide", flush);
}
