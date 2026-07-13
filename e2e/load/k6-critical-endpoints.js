/**
 * k6 load test — 100 concurrent virtual users hitting critical public
 * endpoints of uniqueapp.fun for 2 minutes.
 *
 * Run locally:
 *   k6 run e2e/load/k6-critical-endpoints.js
 * or via CI (see .github/workflows/load-test.yml).
 *
 * Thresholds fail the run if:
 *   - p95 latency > 2s
 *   - error rate > 2%
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const errors = new Rate("errors");

export const options = {
  stages: [
    { duration: "30s", target: 25 },
    { duration: "60s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    errors: ["rate<0.02"],
  },
};

const BASE = __ENV.BASE_URL || "https://www.uniqueapp.fun";

const ROUTES = [
  "/",
  "/wall",
  "/megatalent",
  "/dating",
  "/jobs",
  "/bazaar",
  "/education",
  "/health",
  "/kids",
  "/creators",
  "/pricing",
  "/rewards",
  "/blog",
  "/tennis-arena",
  "/brand-arena",
];

export default function () {
  const route = ROUTES[Math.floor(Math.random() * ROUTES.length)];
  const res = http.get(`${BASE}${route}`, {
    tags: { route },
    headers: { "User-Agent": "k6-loadtest/uniqueapp" },
  });
  const ok = check(res, {
    "status is 2xx or 3xx": (r) => r.status >= 200 && r.status < 400,
    "body not empty": (r) => (r.body || "").length > 100,
  });
  errors.add(!ok);
  sleep(Math.random() * 2 + 0.5);
}

export function handleSummary(data) {
  return {
    "e2e/crawler-report/load-report.json": JSON.stringify(data, null, 2),
    stdout: `\nk6 load test complete — see e2e/crawler-report/load-report.json\n`,
  };
}
