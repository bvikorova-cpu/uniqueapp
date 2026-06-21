/**
 * Full PDF checklist smoke test — drives every route from
 * `Unique – Manuálny testovací checklist` and records:
 *  - JS console errors
 *  - HTTP 4xx/5xx network failures (filtered to app origin + supabase)
 *  - Pages that never render anything (blank body)
 *
 * Produces a JSON + text report in test-results/pdf-checklist/.
 */
import { test, expect, ConsoleMessage, Request, Response } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const ROUTES: { section: string; path: string }[] = [
  // 1. Auth & Onboarding
  { section: "auth", path: "/auth" },
  { section: "auth", path: "/onboarding" },
  // 2. Wall
  { section: "wall", path: "/wall" },
  { section: "wall", path: "/wall/videos" },
  { section: "wall", path: "/wall/friends" },
  { section: "wall", path: "/wall/friends/requests" },
  { section: "wall", path: "/wall/friends/suggestions" },
  { section: "wall", path: "/wall/groups" },
  { section: "wall", path: "/wall/pages" },
  { section: "wall", path: "/wall/events" },
  { section: "wall", path: "/wall/messages" },
  { section: "wall", path: "/wall/notifications" },
  { section: "wall", path: "/wall/memories" },
  { section: "wall", path: "/wall/saved" },
  { section: "wall", path: "/wall/trending" },
  { section: "wall", path: "/wall/info" },
  // 3. Gamification & XP
  { section: "rewards", path: "/rewards" },
  { section: "rewards", path: "/rewards/challenges" },
  { section: "rewards", path: "/rewards/leaderboard" },
  { section: "rewards", path: "/rewards/badges" },
  { section: "rewards", path: "/rewards/achievements" },
  { section: "rewards", path: "/credits" },
  // 4. Profile & Account
  { section: "profile", path: "/profile" },
  { section: "profile", path: "/profile/edit" },
  { section: "profile", path: "/settings" },
  { section: "profile", path: "/settings/privacy" },
  { section: "profile", path: "/settings/security" },
  { section: "profile", path: "/settings/billing" },
  { section: "profile", path: "/settings/notifications" },
  // 5. Payments
  { section: "payments", path: "/credits/buy" },
  { section: "payments", path: "/pricing" },
  // 6. AI Tools
  { section: "ai", path: "/ai/clone" },
  { section: "ai", path: "/ai/mentor" },
  { section: "ai", path: "/ai/tattoo" },
  { section: "ai", path: "/ai/astrology" },
  { section: "ai", path: "/ai/bedtime-stories" },
  { section: "ai", path: "/ai/brand-builder" },
  { section: "ai", path: "/ai/character-battle" },
  { section: "ai", path: "/ai/cooking" },
  { section: "ai", path: "/ai/dream-journal" },
  { section: "ai", path: "/ai/food-scanner" },
  { section: "ai", path: "/ai/future-face" },
  { section: "ai", path: "/ai/handwriting" },
  { section: "ai", path: "/ai/holographic-avatars" },
  { section: "ai", path: "/ai/lie-detector" },
  { section: "ai", path: "/ai/lottery" },
  { section: "ai", path: "/ai/dna" },
  { section: "ai", path: "/ai/multiverse" },
  { section: "ai", path: "/ai/phobia" },
  { section: "ai", path: "/ai/reincarnation" },
  { section: "ai", path: "/ai/time-capsule" },
  { section: "ai", path: "/ai/time-reversal" },
  { section: "ai", path: "/ai/quantum" },
  { section: "ai", path: "/ai/crystal-energy" },
  { section: "ai", path: "/ai/confessions" },
  // 7. Huby
  { section: "hub", path: "/megatalent" },
  { section: "hub", path: "/kitchenstars" },
  { section: "hub", path: "/education" },
  { section: "hub", path: "/kids" },
  { section: "hub", path: "/teen" },
  { section: "hub", path: "/dating" },
  { section: "hub", path: "/bazaar" },
  { section: "hub", path: "/jobs" },
  { section: "hub", path: "/comedy-club" },
  { section: "hub", path: "/f1-racing" },
  { section: "hub", path: "/tennis-arena" },
  { section: "hub", path: "/sports" },
  { section: "hub", path: "/live" },
  { section: "hub", path: "/concerts" },
  { section: "hub", path: "/fundraising" },
  { section: "hub", path: "/games" },
  { section: "hub", path: "/wellness" },
  { section: "hub", path: "/beauty" },
  { section: "hub", path: "/fashion-studio" },
  { section: "hub", path: "/nutrition" },
  { section: "hub", path: "/fitness" },
  { section: "hub", path: "/community" },
  { section: "hub", path: "/music" },
  { section: "hub", path: "/vacationer" },
  { section: "hub", path: "/investment" },
  { section: "hub", path: "/referral" },
  { section: "hub", path: "/brand-arena" },
  // 8. Admin (expect 403/redirect for non-admin)
  { section: "admin", path: "/admin/bazaar-trust" },
  { section: "admin", path: "/admin/brand-campaigns" },
  { section: "admin", path: "/admin/comedy-payouts" },
  { section: "admin", path: "/admin/influencer-payouts" },
  { section: "admin", path: "/admin/masterchef-payouts" },
  { section: "admin", path: "/admin/corporate-inquiries" },
  { section: "admin", path: "/admin/coupon-disputes" },
  { section: "admin", path: "/admin/iq-analytics" },
  { section: "admin", path: "/admin/payment-dashboard" },
  { section: "admin", path: "/admin/platform-earnings" },
  { section: "admin", path: "/admin/sports" },
  { section: "admin", path: "/admin/tipsters" },
  { section: "admin", path: "/admin/transactions" },
  { section: "admin", path: "/admin/verifications" },
  { section: "admin", path: "/admin/withdrawals" },
  { section: "admin", path: "/admin/xp-audit" },
  { section: "admin", path: "/admin/xp-reconciliation" },
  // 10. SEO & Legal
  { section: "legal", path: "/legal/terms" },
  { section: "legal", path: "/legal/privacy" },
  { section: "legal", path: "/legal/cookies" },
  // 11. 404
  { section: "errors", path: "/this-route-should-404-xyz" },
];

type Finding = {
  section: string;
  path: string;
  consoleErrors: string[];
  netFailures: { url: string; status: number; method: string }[];
  loadOk: boolean;
  finalUrl: string;
  bodyText: string;
};

const IGNORED_CONSOLE = [
  /Unknown message type: RESET_BLANK_CHECK/,
  /Download the React DevTools/,
  /lovable\.js/,
  /\[gpteng\]/,
  /service-worker/i,
  /Failed to load resource.*sourcemap/,
  /vite-plugin-checker/,
  /Failed to fetch.*supabase-/i,
  /TypeError: Failed to fetch/i,
];

const IGNORED_NET = [
  /chrome-extension:/,
  /cdn\.gpteng\.co/,
  /lovableproject\.com\/__lovable/,
  /__l5e\//,
  /analytics|gtag|google-analytics|googletagmanager|sentry|monetag/i,
  /vitals-ingest/,
  /trackevents/,
];

test.describe.configure({ mode: "serial" });

test("PDF checklist – smoke all routes", async ({ page, baseURL }) => {
  test.setTimeout(20 * 60_000);
  const findings: Finding[] = [];

  for (const r of ROUTES) {
    const consoleErrors: string[] = [];
    const netFailures: { url: string; status: number; method: string }[] = [];

    const onConsole = (m: ConsoleMessage) => {
      if (m.type() !== "error") return;
      const t = m.text();
      if (IGNORED_CONSOLE.some((re) => re.test(t))) return;
      consoleErrors.push(t.slice(0, 400));
    };
    const onResponse = (resp: Response) => {
      const status = resp.status();
      // Only treat real HTTP failures as findings; status 0 happens for aborted/preflight noise
      if (status < 400) return;
      const url = resp.url();
      if (IGNORED_NET.some((re) => re.test(url))) return;
      netFailures.push({ url: url.slice(0, 200), status, method: resp.request().method() });
    };
    const onRequestFailed = (_req: Request) => {
      // Ignored — too noisy with aborted preflights and disconnected HEAD probes.
    };

    page.on("console", onConsole);
    page.on("response", onResponse);
    page.on("requestfailed", onRequestFailed);

    let loadOk = true;
    let finalUrl = "";
    let bodyText = "";
    try {
      await page.goto(r.path, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await page.waitForTimeout(1200); // settle
      finalUrl = page.url();
      bodyText = (await page.locator("body").innerText().catch(() => "")).slice(0, 300);
    } catch (e: any) {
      loadOk = false;
      consoleErrors.push(`[goto] ${String(e?.message || e).slice(0, 300)}`);
    }

    page.off("console", onConsole);
    page.off("response", onResponse);
    page.off("requestfailed", onRequestFailed);

    findings.push({
      section: r.section,
      path: r.path,
      consoleErrors,
      netFailures,
      loadOk,
      finalUrl,
      bodyText,
    });
  }

  // Write report
  mkdirSync("test-results/pdf-checklist", { recursive: true });
  writeFileSync(
    "test-results/pdf-checklist/report.json",
    JSON.stringify(findings, null, 2),
  );

  // Plain text summary
  const lines: string[] = [];
  let problemRoutes = 0;
  for (const f of findings) {
    const hasProblem =
      !f.loadOk ||
      f.consoleErrors.length > 0 ||
      f.netFailures.length > 0 ||
      f.bodyText.trim().length < 5;
    if (!hasProblem) continue;
    problemRoutes++;
    lines.push(`\n# [${f.section}] ${f.path}  →  ${f.finalUrl}`);
    if (!f.loadOk) lines.push(`  ! goto failed`);
    if (f.bodyText.trim().length < 5) lines.push(`  ! body looks blank (got: ${JSON.stringify(f.bodyText)})`);
    for (const c of f.consoleErrors) lines.push(`  console: ${c}`);
    for (const n of f.netFailures) lines.push(`  net ${n.status} ${n.method} ${n.url}`);
  }
  lines.unshift(`PDF checklist smoke — ${findings.length} routes, ${problemRoutes} with issues\n`);
  writeFileSync("test-results/pdf-checklist/report.txt", lines.join("\n"));
  console.log(lines.join("\n"));

  expect(findings.length).toBe(ROUTES.length);
});
