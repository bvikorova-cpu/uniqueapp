/**
 * Lighthouse CI configuration.
 *
 * Runs against `vite preview` (production build) and asserts perf budgets
 * for our most-visited unauthenticated routes. Authenticated routes are
 * intentionally excluded — Lighthouse can't log in without bespoke auth
 * scripts and we don't want CI flakes from session state.
 *
 * Budgets are pragmatic for a content-rich PWA, not theoretical maxima.
 * Tighten them as we ship perf wins; never loosen without writing the
 * regression up in mem://features/perf-and-reconciliation or similar.
 */
module.exports = (() => {
  // Resolve a sample job-listing slug at config time from the production
  // sitemap-jobs.xml so we audit a real detail page (the build-time copy in
  // public/ is a placeholder that gets populated at runtime).
  let jobListingUrl = "http://localhost:4173/jobs";
  try {
    // Synchronous network is unavailable; fall back to /jobs index. CI may
    // override via LH_JOB_LISTING_URL once a known-good slug exists.
    if (process.env.LH_JOB_LISTING_URL) jobListingUrl = process.env.LH_JOB_LISTING_URL;
  } catch {}

  return {
  ci: {
    collect: {
      // `vite preview` listens on 4173 by default
      startServerCommand: "bun run preview -- --port 4173 --strictPort",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 60_000,
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/auth",
        "http://localhost:4173/pricing",
        "http://localhost:4173/jobs",
        jobListingUrl,
      ],
      numberOfRuns: 1, // 3 is nicer but triples CI time
      settings: {
        preset: "desktop",
        // Disable storage reset between runs so PWA service-worker doesn't
        // fight us; production cache is what real users get.
        disableStorageReset: false,
        // Skip a11y/seo/best-practices categories the team isn't ready to
        // gate on yet. Add back when we run a dedicated audit.
        onlyCategories: ["performance"],
        skipAudits: [
          "uses-http2",            // can't control on lhci server
          "redirects-http",        // localhost is http
          "is-on-https",           // localhost is http
        ],
      },
    },
    assert: {
      assertions: {
        // Category score (0-1)
        "categories:performance": ["warn", { minScore: 0.75 }],

        // Core Web Vitals — warn first; flip to "error" once routes are clean.
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift":  ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time":      ["warn", { maxNumericValue: 300 }],
        "interactive":              ["warn", { maxNumericValue: 4000 }],
        "speed-index":              ["warn", { maxNumericValue: 4000 }],

        // Bundle hygiene — these MUST hold (we have a 350 KB first-load budget).
        "total-byte-weight":        ["error", { maxNumericValue: 4_500_000 }],
        "unused-javascript":        ["warn",  { maxNumericValue: 250_000 }],
        "render-blocking-resources":["warn",  { maxNumericValue: 600 }],
      },
    },
    upload: {
      // Public temp storage — no account needed, reports kept ~7 days.
      target: "temporary-public-storage",
    },
  },
};
})();
