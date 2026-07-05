/**
 * MASTER QA (AUTHED) — validates content BEHIND the login wall.
 *
 * Runs with the pre-authenticated storage state from auth.setup.ts.
 * Each test asserts the actual product is functional for a paying user,
 * not just that a route returned 200.
 *
 * Flows:
 *   1. /live-concerts — Concert hub loads with tool cards (Browse, VIP, etc.)
 *   2. /holographic-avatars — Hub renders with Generate/avatar controls
 *   3. /megatalent — Candidate grid or contest content visible
 *   4. /account/credits — Credit balance UI renders
 *   5. Stripe create-checkout — Returns a real checkout URL (not 401)
 *   6. Zero critical console errors
 */
import { test, expect, Page, ConsoleMessage } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS = path.resolve(__dirname, "..", "master-qa-artifacts", "authed");
const SCREENS = path.join(ARTIFACTS, "screens");
const REPORT = path.join(ARTIFACTS, "report.json");
fs.mkdirSync(SCREENS, { recursive: true });

type FlowResult = { name: string; status: "pass" | "fail"; detail?: string; screenshot?: string };
const results: FlowResult[] = [];

const CONSOLE_WHITELIST = [
  /google.*ads/i,
  /gtag/i,
  /facebook\.com\/tr/i,
  /doubleclick/i,
  /preloaded/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /sentry/i,
  /ResizeObserver loop/i,
  /Manifest.*icon/i,
];
const criticalConsoleErrors: string[] = [];

function watch(page: Page, flow: string) {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (CONSOLE_WHITELIST.some((rx) => rx.test(text))) return;
    criticalConsoleErrors.push(`[${flow}] ${text}`);
  });
  page.on("pageerror", (err) => criticalConsoleErrors.push(`[${flow}] pageerror: ${err.message}`));
}

async function shot(page: Page, name: string) {
  const p = path.join(SCREENS, `${name}.png`);
  try { await page.screenshot({ path: p }); } catch {}
  return path.relative(ARTIFACTS, p);
}

async function goto(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForFunction(
    () => {
      if (document.body?.innerText?.toLowerCase().includes("loading unique")) return false;
      const main = document.querySelector("main");
      if ((main?.innerText || "").trim().length > 200) return true;
      const h = document.querySelector("h1, h2");
      return !!(h && (h.textContent || "").trim().length > 3);
    },
    undefined,
    { timeout: 25_000 }
  ).catch(() => {});
  await page.waitForTimeout(600);
}

test.describe.configure({ mode: "parallel" });

test.describe("Master QA (authed) — content behind login", () => {
  test.afterAll(async () => {
    fs.writeFileSync(REPORT, JSON.stringify({
      generatedAt: new Date().toISOString(),
      baseURL: process.env.PLAYWRIGHT_BASE_URL ?? null,
      results,
      criticalConsoleErrors,
    }, null, 2));
    const pass = results.filter((r) => r.status === "pass").length;
    const fail = results.filter((r) => r.status === "fail").length;
    // eslint-disable-next-line no-console
    console.log(`\nMaster QA (authed): ${pass} pass, ${fail} fail`);
    for (const r of results.filter((r) => r.status === "fail")) {
      // eslint-disable-next-line no-console
      console.log(`  FAIL ${r.name}: ${r.detail ?? ""}`);
    }
  });

  test("1. /live-concerts hub renders with real content", async ({ page }) => {
    watch(page, "live-concerts");
    try {
      await goto(page, "/live-concerts");
      // If we got redirected to /auth, session didn't wake up.
      if (/\/auth(\b|\/)/.test(page.url())) throw new Error(`redirected to auth: ${page.url()}`);
      const screenshot = await shot(page, "01-live-concerts");
      const txt = (await page.locator("main, body").first().innerText()).toLowerCase();
      // Real concert-hub markers (from LiveConcerts tools array).
      const markers = ["browse concerts", "vip experience", "fan leaderboard", "setlist"];
      const hit = markers.filter((m) => txt.includes(m));
      if (hit.length < 2) {
        throw new Error(`only ${hit.length}/4 concert hub markers found (need >=2): ${hit.join(", ") || "none"}`);
      }
      results.push({ name: "live-concerts-authed", status: "pass", screenshot, detail: `${hit.length} markers` });
    } catch (e: any) {
      results.push({ name: "live-concerts-authed", status: "fail", detail: e.message });
      throw e;
    }
  });

  test("2. /holographic-avatars hub renders with generation UI", async ({ page }) => {
    watch(page, "holographic");
    try {
      await goto(page, "/holographic-avatars");
      if (/\/auth(\b|\/)/.test(page.url())) throw new Error(`redirected to auth: ${page.url()}`);
      const screenshot = await shot(page, "02-holographic");
      const txt = (await page.locator("main, body").first().innerText()).toLowerCase();
      if (!/holograph|avatar/i.test(txt)) throw new Error("no holographic/avatar content");
      // Look for either a generate CTA or a gallery
      const hasCta = await page.getByRole("button", { name: /generate|create|new avatar/i }).count();
      if (hasCta === 0 && !/gallery|my avatars|hologram/i.test(txt)) {
        throw new Error("no generate CTA nor gallery");
      }
      results.push({ name: "holographic-authed", status: "pass", screenshot });
    } catch (e: any) {
      results.push({ name: "holographic-authed", status: "fail", detail: e.message });
      throw e;
    }
  });

  test("3. /megatalent shows real contest content", async ({ page }) => {
    watch(page, "megatalent");
    try {
      await goto(page, "/megatalent");
      const screenshot = await shot(page, "03-megatalent");
      const txt = (await page.locator("main, body").first().innerText()).toLowerCase();
      if (!/megatalent|candidate|contest|vote|prize/i.test(txt)) {
        throw new Error("no megatalent content markers");
      }
      results.push({ name: "megatalent-authed", status: "pass", screenshot });
    } catch (e: any) {
      results.push({ name: "megatalent-authed", status: "fail", detail: e.message });
      throw e;
    }
  });

  test("4. /account/credits shows a credit balance", async ({ page }) => {
    watch(page, "credits");
    try {
      await goto(page, "/account/credits");
      if (/\/auth(\b|\/)/.test(page.url())) throw new Error(`redirected to auth: ${page.url()}`);
      const screenshot = await shot(page, "04-credits");
      const txt = (await page.locator("main, body").first().innerText()).toLowerCase();
      if (!/credit|balance|top up|buy/i.test(txt)) {
        throw new Error("no credit-balance UI markers");
      }
      results.push({ name: "credits-authed", status: "pass", screenshot });
    } catch (e: any) {
      results.push({ name: "credits-authed", status: "fail", detail: e.message });
      throw e;
    }
  });

  test("5. Stripe create-checkout returns real URL (authed)", async ({ page }) => {
    try {
      // Grab the authed access token from localStorage (seeded by auth.setup.ts).
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const token = await page.evaluate(() => {
        const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
        if (!key) return null;
        try { return JSON.parse(localStorage.getItem(key)!).access_token as string; } catch { return null; }
      });
      if (!token) throw new Error("no access_token in localStorage — auth.setup did not run");

      const res = await page.request.post(
        "https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/create-checkout",
        {
          headers: {
            "content-type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q",
            authorization: `Bearer ${token}`,
          },
          data: { creditType: "ai_credits", credits: 30 },
          timeout: 15_000,
        }
      );
      const status = res.status();
      if (status >= 400) throw new Error(`create-checkout HTTP ${status}: ${await res.text()}`);
      const body = await res.json();
      if (!body.url || !/^https:\/\/(checkout\.stripe\.com|.*stripe.*)/i.test(body.url)) {
        throw new Error(`no valid Stripe URL in response: ${JSON.stringify(body).slice(0, 200)}`);
      }
      results.push({ name: "stripe-checkout-authed", status: "pass", detail: `URL ok (${status})` });
    } catch (e: any) {
      results.push({ name: "stripe-checkout-authed", status: "fail", detail: e.message });
      throw e;
    }
  });

  test("6. No critical console errors across authed flows", async () => {
    if (criticalConsoleErrors.length > 0) {
      results.push({
        name: "console-errors-authed",
        status: "fail",
        detail: `${criticalConsoleErrors.length}; first: ${criticalConsoleErrors[0]}`,
      });
      throw new Error(
        `Critical console errors:\n` + criticalConsoleErrors.slice(0, 10).join("\n")
      );
    }
    results.push({ name: "console-errors-authed", status: "pass" });
  });
});
