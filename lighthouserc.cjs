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
      startServerCommand: "bunx vite preview --port 4173 --strictPort",
      startServerReadyPattern: "Local:",
      startServerReadyTimeout: 120_000,
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/auth",
        "http://localhost:4173/pricing",
        "http://localhost:4173/jobs",
        jobListingUrl,
      ],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        disableStorageReset: false,
        onlyCategories: ["performance"],
        skipAudits: [
          "uses-http2",
          "redirects-http",
          "is-on-https",
        ],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.5 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "cumulative-layout-shift":  ["warn", { maxNumericValue: 0.25 }],
        "total-blocking-time":      ["warn", { maxNumericValue: 600 }],
        "interactive":              ["warn", { maxNumericValue: 6000 }],
        "speed-index":              ["warn", { maxNumericValue: 6000 }],
        "total-byte-weight":        ["warn", { maxNumericValue: 8_000_000 }],
        "unused-javascript":        ["warn", { maxNumericValue: 500_000 }],
        "render-blocking-resources":["warn", { maxNumericValue: 1000 }],
      },

    },
    upload: {
      // Public temp storage — no account needed, reports kept ~7 days.
      target: "temporary-public-storage",
    },
  },
};
})();
