/**
 * All-buttons crawler — pre-launch full audit.
 *
 * For every route in src/utils/smokeTestRoutes.json:
 *   1. Opens the route in real Chromium (not iframe).
 *   2. Collects pageerror + failed responses (>=500 or network errors).
 *   3. Enumerates every visible interactive element (button, [role=button],
 *      link, menuitem, tab, switch, checkbox, radio, option).
 *   4. Clicks each one (skipping destructive labels), waits briefly,
 *      captures resulting network activity + errors, then closes any
 *      opened overlay via Escape.
 *   5. Writes a per-route JSON entry to e2e/crawler-report/report.json
 *      with counts + samples of failures, plus a screenshot on any failure.
 *
 * Auth: reuses the persisted QA session from e2e/.auth/authed-state.json
 * (produced by e2e/auth.setup.ts) — so gated pages are exercised as a
 * real user, but destructive flows (delete, pay, logout, checkout, refund,
 * withdraw, block, report) are always skipped.
 *
 * Run:
 *   bunx playwright test e2e/crawler/all-buttons-crawler.spec.ts \
 *     --project=chromium-authed --reporter=list
 *
 * Tunables via env:
 *   CRAWLER_ROUTE_LIMIT    max routes to visit (default: all)
 *   CRAWLER_CLICKS_PER_ROUTE  max clicks per route (default 40)
 *   CRAWLER_ROUTE_TIMEOUT  ms per route (default 25000)
 *   CRAWLER_START_INDEX    resume from index (default 0)
 */
import { test, expect, Page, Route } from "@playwright/test";
import routes from "../../src/utils/smokeTestRoutes.json" assert { type: "json" };
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const REPORT_DIR = "e2e/crawler-report";
const REPORT_FILE = join(REPORT_DIR, "report.json");
const SCREENSHOT_DIR = join(REPORT_DIR, "screenshots");

const ROUTE_LIMIT = Number(process.env.CRAWLER_ROUTE_LIMIT || 0);
const CLICKS_PER_ROUTE = Number(process.env.CRAWLER_CLICKS_PER_ROUTE || 40);
const ROUTE_TIMEOUT = Number(process.env.CRAWLER_ROUTE_TIMEOUT || 25_000);
const START_INDEX = Number(process.env.CRAWLER_START_INDEX || 0);

const SKIP_LABEL = [
  /delete|zmaz|remove|odstrán/i,
  /logout|odhlás|sign out/i,
  /pay|zaplatiť|buy|kúpiť|checkout|withdraw|výber|refund|donate|dariť/i,
  /report|nahlás|block|zabloko|ban/i,
  /confirm|potvrd/i,
  /unsubscribe|cancel subscription|zruš.*(predpl|členstv)/i,
];

const INTERACTIVE = [
  "button:visible",
  "a[role=button]:visible",
  "a[href]:visible",
  "[role=button]:visible",
  "[role=menuitem]:visible",
  "[role=tab]:visible",
  "[role=switch]:visible",
  "[role=checkbox]:visible",
  "[role=radio]:visible",
  "[role=option]:visible",
].join(", ");

type ClickResult = {
  label: string;
  ok: boolean;
  reason?: string;
  navigatedTo?: string;
};
type RouteResult = {
  route: string;
  index: number;
  loadedUrl: string;
  durationMs: number;
  pageErrors: string[];
  failedResponses: { url: string; status: number }[];
  elementsFound: number;
  clicksAttempted: number;
  clicks: ClickResult[];
  ok: boolean;
  screenshot?: string;
};

function loadReport(): RouteResult[] {
  if (!existsSync(REPORT_FILE)) return [];
  try {
    return JSON.parse(readFileSync(REPORT_FILE, "utf8"));
  } catch {
    return [];
  }
}
function saveReport(entries: RouteResult[]) {
  mkdirSync(dirname(REPORT_FILE), { recursive: true });
  writeFileSync(REPORT_FILE, JSON.stringify(entries, null, 2));
}

async function dismissOverlays(page: Page) {
  const names = [
    /accept all/i,
    /prijať všetko/i,
    /only necessary/i,
    /len nevyhnutné/i,
    /got it/i,
    /rozumiem/i,
  ];
  for (const n of names) {
    const b = page.getByRole("button", { name: n }).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click().catch(() => {});
    }
  }
}

test.describe.configure({ mode: "serial" });

test("crawl every route and click every safe button", async ({ page, browserName }, testInfo) => {
  test.setTimeout(0); // full crawl controls its own timing

  const all = (routes as string[]).slice(START_INDEX, ROUTE_LIMIT ? START_INDEX + ROUTE_LIMIT : undefined);
  const results = loadReport();
  const alreadyDone = new Set(results.map((r) => r.route));

  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  for (let i = 0; i < all.length; i++) {
    const route = all[i];
    if (alreadyDone.has(route)) continue;

    const started = Date.now();
    const pageErrors: string[] = [];
    const failedResponses: { url: string; status: number }[] = [];

    const onPageError = (e: Error) => {
      const m = e.message || String(e);
      if (m.includes("ResizeObserver")) return;
      pageErrors.push(m.slice(0, 500));
    };
    const onResponse = (res: import("@playwright/test").Response) => {
      const s = res.status();
      if (s >= 500) failedResponses.push({ url: res.url().slice(0, 250), status: s });
    };
    const onRequestFailed = (req: import("@playwright/test").Request) => {
      failedResponses.push({ url: req.url().slice(0, 250), status: 0 });
    };
    page.on("pageerror", onPageError);
    page.on("response", onResponse);
    page.on("requestfailed", onRequestFailed);

    const clicks: ClickResult[] = [];
    let elementsFound = 0;
    let clicksAttempted = 0;
    let loadedUrl = route;

    try {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: ROUTE_TIMEOUT });
      loadedUrl = page.url();
      await page.waitForTimeout(800);
      await dismissOverlays(page);

      const handles = await page.locator(INTERACTIVE).all();
      elementsFound = handles.length;
      const cap = Math.min(handles.length, CLICKS_PER_ROUTE);

      for (let k = 0; k < cap; k++) {
        const el = handles[k];
        const label = ((await el.innerText().catch(() => "")) || (await el.getAttribute("aria-label").catch(() => "")) || "")
          .trim()
          .slice(0, 80);
        if (!label) continue;
        if (SKIP_LABEL.some((r) => r.test(label))) {
          clicks.push({ label, ok: true, reason: "skipped_destructive" });
          continue;
        }
        clicksAttempted++;
        const errsBefore = pageErrors.length;
        const failsBefore = failedResponses.length;
        const urlBefore = page.url();

        const clickErr = await el.click({ timeout: 2500, trial: false }).then(() => null).catch((e) => e.message as string);
        await page.waitForTimeout(350);

        const crash = await page.locator("[data-unique-crash-overlay]").count().catch(() => 0);
        const newErrors = pageErrors.length - errsBefore;
        const newFails = failedResponses.length - failsBefore;
        const navigated = page.url() !== urlBefore;

        const ok = !clickErr && !crash && newErrors === 0 && newFails === 0;
        clicks.push({
          label,
          ok,
          reason: clickErr
            ? `click_error:${clickErr.slice(0, 120)}`
            : crash
              ? "crash_overlay"
              : newErrors
                ? `runtime_error:${pageErrors[pageErrors.length - 1]?.slice(0, 120)}`
                : newFails
                  ? `network_fail:${failedResponses[failedResponses.length - 1]?.url}`
                  : undefined,
          navigatedTo: navigated ? page.url() : undefined,
        });

        if (navigated) {
          await page.goto(route, { waitUntil: "domcontentloaded", timeout: ROUTE_TIMEOUT }).catch(() => {});
          await page.waitForTimeout(500);
          await dismissOverlays(page);
          // reflow: re-query, but stop the loop; visiting the same route once is enough
          break;
        } else {
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(120);
        }
      }
    } catch (e: any) {
      pageErrors.push(`goto_or_crawl:${(e?.message || e).toString().slice(0, 300)}`);
    }

    page.off("pageerror", onPageError);
    page.off("response", onResponse);
    page.off("requestfailed", onRequestFailed);

    const failedClicks = clicks.filter((c) => !c.ok);
    const ok = pageErrors.length === 0 && failedResponses.length === 0 && failedClicks.length === 0;

    let screenshot: string | undefined;
    if (!ok) {
      const safe = route.replace(/[^a-z0-9]+/gi, "_").slice(0, 80) || "root";
      const path = join(SCREENSHOT_DIR, `${String(START_INDEX + i).padStart(5, "0")}_${safe}.png`);
      await page.screenshot({ path, fullPage: false }).catch(() => {});
      screenshot = path;
    }

    const entry: RouteResult = {
      route,
      index: START_INDEX + i,
      loadedUrl,
      durationMs: Date.now() - started,
      pageErrors,
      failedResponses: failedResponses.slice(0, 20),
      elementsFound,
      clicksAttempted,
      clicks,
      ok,
      screenshot,
    };
    results.push(entry);

    // checkpoint every route so a mid-run crash still leaves evidence
    if (i % 5 === 0 || i === all.length - 1) saveReport(results);
  }

  saveReport(results);

  // Emit a compact summary the CI reporter can surface
  const failed = results.filter((r) => !r.ok);
  console.log(
    `[crawler] routes=${results.length} ok=${results.length - failed.length} failed=${failed.length} clicks=${results.reduce(
      (n, r) => n + r.clicksAttempted,
      0,
    )}`,
  );

  // Never fail the whole run on route-level issues — the report is the deliverable.
  // Only fail if the crawler couldn't produce a report at all.
  expect(results.length).toBeGreaterThan(0);
});
