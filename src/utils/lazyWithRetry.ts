import { lazy, type ComponentType } from "react";

/**
 * Wraps `React.lazy` with automatic retry + cache-bust + one-time hard reload.
 *
 * Why: After a new build is deployed, the user's loaded HTML still references
 * old chunk filenames. The next dynamic `import()` then fails with
 * "Failed to fetch dynamically imported module" / chunk load errors.
 *
 * Strategy:
 *  1. Retry the import a few times with a short delay (covers transient
 *     network blips and Vite dev HMR restarts).
 *  2. If retries fail, set a sessionStorage flag and force a single full
 *     page reload — this re-fetches index.html with current chunk hashes.
 *  3. The reload flag prevents an infinite reload loop.
 */

const RELOAD_KEY = "unique_chunk_reload_v1";

function isChunkLoadError(err: unknown): boolean {
  const msg = String((err as Error)?.message || err || "");
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("Loading chunk") ||
    msg.includes("Loading CSS chunk") ||
    msg.includes("error loading dynamically imported module")
  );
}

export function retryImport<T>(
  factory: () => Promise<T>,
  retries = 2,
  delayMs = 400,
): Promise<T> {
  return factory().catch((err) => {
    if (retries <= 0 || !isChunkLoadError(err)) {
      // Last-ditch: if it's a chunk error and we haven't reloaded yet, do so.
      if (isChunkLoadError(err) && typeof window !== "undefined") {
        try {
          if (!sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
            // Cache-bust query string forces fresh index.html + chunk manifest.
            const url = new URL(window.location.href);
            url.searchParams.set("__r", String(Date.now()));
            window.location.replace(url.toString());
            // Return a never-resolving promise so React doesn't render an error
            // before the navigation happens.
            return new Promise<T>(() => {});
          }
        } catch {
          /* noop */
        }
      }
      throw err;
    }
    return new Promise<T>((resolve) => setTimeout(resolve, delayMs)).then(() =>
      retryImport(factory, retries - 1, delayMs * 2),
    );
  });
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() => retryImport(factory));
}

// Clear the reload guard once the app has successfully booted, so future
// stale-chunk events can trigger a fresh recovery.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* noop */
      }
    }, 5000);
  });
}
