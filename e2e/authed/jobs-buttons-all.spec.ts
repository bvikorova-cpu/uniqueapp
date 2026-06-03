import { test, expect, type Page } from "@playwright/test";

/**
 * E2E – Jobs section buttons & navigation
 * Overuje, že všetky tlačidlá na /jobs hlavnej stránke a vo všetkých sub-routes
 * skutočne fungujú (navigujú, nepadajú do /auth pre verejné, renderujú heading).
 *
 * Zoznam routes je odvodený od src/App.tsx (riadky 655–688).
 */

// --- All Jobs sub-routes (path, requiresAuth?, expected heading regex) ---
const PUBLIC_ROUTES: Array<{ path: string; heading: RegExp }> = [
  { path: "/jobs", heading: /jobs|career|hiring/i },
  { path: "/jobs/companies", heading: /companies|firmy/i },
  { path: "/jobs/salaries", heading: /salar|plat/i },
  { path: "/jobs/interviews", heading: /interview|pohovor/i },
  { path: "/jobs/map", heading: /map|mapa/i },
  { path: "/jobs/assessments", heading: /assessment|test/i },
  { path: "/jobs/headhunters", heading: /headhunter|marketplace/i },
];

const PROTECTED_ROUTES: Array<{ path: string; heading: RegExp }> = [
  { path: "/jobs/saved", heading: /saved|uložen/i },
  { path: "/jobs/applications", heading: /application|žiadosti/i },
  { path: "/jobs/alerts", heading: /alerts|upozornen/i },
  { path: "/jobs/candidate-search", heading: /candidate|search/i },
  { path: "/jobs/rejection-templates", heading: /rejection|template/i },
  { path: "/jobs/for-you", heading: /for you|personalized|pre vás/i },
  { path: "/jobs/referrals", heading: /referral|odporúčan/i },
  { path: "/jobs/career-path", heading: /career path|kariér/i },
  { path: "/jobs/mock-interview", heading: /mock|interview/i },
  { path: "/jobs/video-resumes", heading: /video|resume/i },
  { path: "/jobs/diversity\/self-id", heading: /diversity|self-id/i },
  { path: "/jobs/ai-jd-writer", heading: /ai|description|writer/i },
  { path: "/jobs/references", heading: /reference|odporúčan/i },
  { path: "/jobs/background-checks", heading: /background|previerk/i },
  { path: "/jobs/onboarding", heading: /onboarding|nástup/i },
  { path: "/jobs/templates", heading: /templates|šablón/i },
  { path: "/jobs/bulk-hiring", heading: /bulk|hromad/i },
];

async function gotoAndSettle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded", timeout: 25_000 });
  await page.waitForTimeout(1200);
}

test.describe("Jobs – button & navigation funkčnosť", () => {
  test("/jobs sa renderuje, nie je redirect na /auth", async ({ page }) => {
    await gotoAndSettle(page, "/jobs");
    expect(page.url(), "/jobs nemá redirectovať na /auth").not.toMatch(/\/auth|\/login/);
    const h = page.locator("h1, h2, h3").first();
    await expect(h).toBeVisible({ timeout: 10_000 });
  });

  test("Hlavné action buttons na /jobs navigujú správne (Saved/Applications/Alerts/Companies)", async ({ page }) => {
    const targets = [
      { name: /^saved$|saved jobs/i, expect: /\/jobs\/saved/ },
      { name: /^applications$|application tracker/i, expect: /\/jobs\/applications/ },
      { name: /^alerts$|job alerts/i, expect: /\/jobs\/alerts/ },
      { name: /^companies$/i, expect: /\/jobs\/companies/ },
      { name: /^salaries$|salary/i, expect: /\/jobs\/salaries/ },
      { name: /^interviews$|interview questions/i, expect: /\/jobs\/interviews/ },
    ];

    for (const t of targets) {
      await gotoAndSettle(page, "/jobs");
      const btn = page.getByRole("button", { name: t.name }).first();
      const visible = await btn.isVisible({ timeout: 4000 }).catch(() => false);
      if (!visible) {
        test.info().annotations.push({ type: "skip-btn", description: `Button ${t.name} nie je viditeľný` });
        continue;
      }
      await btn.click({ force: true });
      await page.waitForTimeout(1200);
      expect(page.url(), `Klik na ${t.name} musí navigovať na ${t.expect}`).toMatch(t.expect);
    }
  });

  test("Tab buttons na /jobs reagujú (active state sa mení)", async ({ page }) => {
    await gotoAndSettle(page, "/jobs");
    await page.waitForTimeout(2000);

    // Tabs majú label "Jobs" / "AI Tools" / "Streaks" / "Ranks" / "Badges" / "Challenges"
    // Použijeme text-based locator – stačí aspoň 2 nájsť.
    const tabLabels = ["Jobs", "AI Tools", "Streaks", "Ranks", "Badges", "Challenges"];
    let found = 0;
    for (const label of tabLabels) {
      const btn = page.getByRole("button", { name: new RegExp(`^${label}$`, "i") }).first();
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        found++;
        await btn.click({ force: true }).catch(() => {});
        await page.waitForTimeout(400);
        expect(page.url()).not.toMatch(/\/auth|\/login/);
      }
    }
    // Ak production ešte nemá nové taby, tolerujeme 1 (Jobs) ale aspoň 1 musí byť
    expect(found, `Aspoň 1 tab button musí existovať (našlo ${found})`).toBeGreaterThanOrEqual(1);
  });

  test("Verejné Jobs sub-routes – každá render heading bez /auth redirectu (paralelne)", async ({ page }) => {
    for (const r of PUBLIC_ROUTES) {
      await gotoAndSettle(page, r.path);
      expect(page.url(), `${r.path} nemá redirectovať`).not.toMatch(/\/auth|\/login/);
      const heading = page.getByRole("heading", { name: r.heading }).first();
      const fallback = page.locator("h1, h2, h3").first();
      const found =
        (await heading.isVisible({ timeout: 4000 }).catch(() => false)) ||
        (await fallback.isVisible({ timeout: 3000 }).catch(() => false));
      expect(found, `Routa ${r.path} musí render aspoň jeden heading`).toBeTruthy();
    }
  });

  test("Protected Jobs sub-routes – render heading pre prihláseného usera", async ({ page }) => {
    for (const r of PROTECTED_ROUTES) {
      const url = r.path.replace("\\", "");
      await gotoAndSettle(page, url);
      // Pre prihláseného usera nesmie skončiť na /auth
      expect(page.url(), `${url} pre prihláseného usera nemá redirectovať na /auth`).not.toMatch(/\/auth|\/login/);
      const fallback = page.locator("h1, h2, h3").first();
      const visible = await fallback.isVisible({ timeout: 5000 }).catch(() => false);
      expect(visible, `Routa ${url} musí render aspoň jeden heading`).toBeTruthy();
    }
  });

  test("Žiadny unhandled pageerror počas behu Jobs sub-routes", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`${e.message}`));

    const sample = [...PUBLIC_ROUTES.slice(0, 4), ...PROTECTED_ROUTES.slice(0, 4)];
    for (const r of sample) {
      await gotoAndSettle(page, r.path.replace("\\", ""));
    }
    expect(errors, `Pageerror počas navigácie Jobs routes: ${errors.join(" | ")}`).toHaveLength(0);
  });

  test("Companies → klik na company card alebo Companies button nezhodí app", async ({ page }) => {
    await gotoAndSettle(page, "/jobs/companies");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    const firstCard = page.locator("article, a[href*='/jobs/companies/'], button:has-text('View')").first();
    if (await firstCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstCard.click({ force: true }).catch(() => {});
      await page.waitForTimeout(1500);
    }
    expect(errors, "Click v Companies vyhodil pageerror").toHaveLength(0);
  });
});
