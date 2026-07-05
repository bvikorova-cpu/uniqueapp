/**
 * MASTER QA — Full-platform smoke + visual + interactivity + Stripe watcher.
 *
 * Auto-discovers every static <Route path="..."> in src/App.tsx and, for each:
 *   1. Loads the page (visual screenshot saved under e2e/master-qa-artifacts/screens)
 *   2. Records all console errors and page errors
 *   3. Clicks every visible, safe interactive element (buttons, links, inputs focus)
 *   4. Watches network for Stripe checkout failures (4xx/5xx on stripe.com or
 *      create-checkout / verify-*-payment edge functions)
 *   5. Writes a consolidated JSON report to e2e/master-qa-artifacts/report.json
 *
 * Run:
 *   bunx playwright test e2e/master-qa.spec.ts --project=chromium
 *   PLAYWRIGHT_BASE_URL=https://www.uniqueapp.fun bunx playwright test e2e/master-qa.spec.ts
 *
 * Notes:
 * - Dynamic routes (`:id`), admin/auth/checkout gated routes are skipped.
 * - Clicks are safe-guarded: no navigation away, no destructive text
 *   (delete/remove/logout/pay/buy/subscribe), max 15 elements per page.
 * - Stripe failures are collected and reported; the test also FAILS loudly
 *   at the end if any Stripe error was seen so CI notifies you.
 */
import { test, expect, Page, ConsoleMessage, Request, Response } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_TSX = path.resolve(__dirname, "../src/App.tsx");
const ARTIFACTS = path.resolve(__dirname, "master-qa-artifacts");
const SCREENS = path.join(ARTIFACTS, "screens");
const REPORT = path.join(ARTIFACTS, "report.json");

const EXCLUDE = [
  /:[\w]+/, /\*/,
  /^\/admin/, /^\/messenger/, /^\/settings/, /^\/auth/, /^\/reset-password/,
  /^\/verify/, /^\/onboarding/, /^\/checkout/, /^\/billing/, /^\/profile\//,
  /^\/__e2e/, /success$/i, /cancel$/i,
];

const DESTRUCTIVE = /\b(delete|remove|logout|sign\s*out|pay|buy|subscribe|purchase|checkout|confirm|withdraw|cancel|report|block)\b/i;

function discoverRoutes(): string[] {
  const src = fs.readFileSync(APP_TSX, "utf8");
  const set = new Set<string>(["/"]);
  for (const m of src.matchAll(/<Route\s+[^>]*path=["']([^"']+)["']/g)) {
    const p = m[1].startsWith("/") ? m[1] : "/" + m[1];
    if (!EXCLUDE.some((rx) => rx.test(p))) set.add(p);
  }
  return [...set].sort();
}

type RouteReport = {
  path: string;
  status: "ok" | "load_error" | "skipped";
  loadMs: number;
  consoleErrors: string[];
  pageErrors: string[];
  clicked: number;
  clickErrors: string[];
  stripeFailures: { url: string; status: number; body?: string }[];
  screenshot: string | null;
};

const globalReport: {
  startedAt: string;
  finishedAt?: string;
  baseURL?: string;
  totalRoutes: number;
  routes: RouteReport[];
} = { startedAt: new Date().toISOString(), totalRoutes: 0, routes: [] };

fs.mkdirSync(SCREENS, { recursive: true });

const isStripe = (url: string) =>
  /stripe\.com|create-checkout|verify-.*-payment|customer-portal|create-.*-payment/i.test(url);

async function auditRoute(page: Page, route: string): Promise<RouteReport> {
  const r: RouteReport = {
    path: route,
    status: "ok",
    loadMs: 0,
    consoleErrors: [],
    pageErrors: [],
    clicked: 0,
    clickErrors: [],
    stripeFailures: [],
    screenshot: null,
  };

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") r.consoleErrors.push(msg.text().slice(0, 500));
  };
  const onPageError = (err: Error) => r.pageErrors.push(err.message.slice(0, 500));
  const onResponse = async (resp: Response) => {
    const url = resp.url();
    if (!isStripe(url)) return;
    const status = resp.status();
    if (status >= 400) {
      let body: string | undefined;
      try { body = (await resp.text()).slice(0, 400); } catch {}
      r.stripeFailures.push({ url, status, body });
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  const t0 = Date.now();
  try {
    await page.goto(route, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  } catch (e: any) {
    r.status = "load_error";
    r.pageErrors.push(`goto: ${e.message}`);
  }
  r.loadMs = Date.now() - t0;

  // Screenshot
  try {
    const file = path.join(SCREENS, route.replace(/[^\w]+/g, "_") + ".png");
    await page.screenshot({ path: file, fullPage: false });
    r.screenshot = path.relative(ARTIFACTS, file);
  } catch {}

  // Interactivity — safely click visible non-destructive controls
  try {
    const controls = await page
      .locator('button:visible, [role="button"]:visible, a[href^="/"]:visible')
      .all();
    const capped = controls.slice(0, 15);
    for (const el of capped) {
      try {
        const text = ((await el.innerText().catch(() => "")) || "").trim();
        if (!text || DESTRUCTIVE.test(text)) continue;
        const before = page.url();
        await el.click({ trial: false, timeout: 1500, noWaitAfter: true }).catch(() => {});
        r.clicked++;
        // Bounce back if the click navigated away
        if (page.url() !== before) {
          await page.goto(route, { waitUntil: "domcontentloaded", timeout: 15_000 }).catch(() => {});
        }
        // Close any opened dialog
        await page.keyboard.press("Escape").catch(() => {});
      } catch (e: any) {
        r.clickErrors.push(e.message?.slice(0, 200) ?? String(e));
      }
    }
    // Focus each visible input (does not submit anything)
    const inputs = await page.locator("input:visible, textarea:visible").all();
    for (const inp of inputs.slice(0, 10)) {
      await inp.focus().catch(() => {});
    }
  } catch (e: any) {
    r.clickErrors.push(`enumerate: ${e.message ?? e}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);

  return r;
}

const ROUTES = discoverRoutes();

test.describe.configure({ mode: "serial" });

test.describe("Master QA sweep", () => {
  test.setTimeout(15 * 60_000);

  test("audit every static route", async ({ page, baseURL }) => {
    globalReport.baseURL = baseURL;
    globalReport.totalRoutes = ROUTES.length;

    for (const route of ROUTES) {
      const r = await auditRoute(page, route);
      globalReport.routes.push(r);
      console.log(
        `[${r.status}] ${route}  clicked=${r.clicked}  errs=${r.consoleErrors.length + r.pageErrors.length}  stripeFail=${r.stripeFailures.length}`
      );
    }

    globalReport.finishedAt = new Date().toISOString();
    fs.writeFileSync(REPORT, JSON.stringify(globalReport, null, 2));
    console.log(`\n📝 Report: ${REPORT}`);

    const stripeFailures = globalReport.routes.flatMap((r) =>
      r.stripeFailures.map((f) => ({ route: r.path, ...f }))
    );
    if (stripeFailures.length) {
      console.error("\n❌ STRIPE FAILURES DETECTED:\n", JSON.stringify(stripeFailures, null, 2));
    }

    // Soft assertions so the whole sweep completes even with issues, but
    // still fails the test when serious problems are detected.
    expect(stripeFailures, "Stripe checkout failed on one or more routes").toHaveLength(0);
    const loadErrors = globalReport.routes.filter((r) => r.status === "load_error");
    expect(loadErrors, `Routes failed to load: ${loadErrors.map((r) => r.path).join(", ")}`).toHaveLength(0);
  });
});
