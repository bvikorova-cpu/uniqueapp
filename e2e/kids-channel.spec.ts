import { test, expect, type Page } from "@playwright/test";

/**
 * Kids Channel E2E — verifies every Kids Channel route renders without crashing,
 * public hubs are reachable, gated hubs redirect to auth, and the
 * Disney → Fairy Castles legacy redirects still work.
 *
 * IMPORTANT: SPA shows "Loading Unique…" placeholder before React hydrates.
 * Every body-text assertion MUST wait for hydration; otherwise we measure
 * the placeholder and fail with body.length === 16.
 */

async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () => {
        const body = document.body?.innerText?.toLowerCase() ?? "";
        if (body.includes("loading unique")) return false;
        return (
          document.querySelector("header") !== null ||
          document.querySelector("main") !== null ||
          body.length > 80
        );
      },
      { timeout: 15_000 },
    )
    .catch(() => {});
}

const HUB_SLUGS = [
  "children", "age-filter", "path", "saved", "reports", "screen-time",
  "curriculum", "recommend", "safety", "approval", "narration", "phonics",
  "math", "difficulty", "pet", "economy", "assignments", "share",
];

const PUBLIC_ROUTES = [
  "/kids-channel",
  "/kids-channel/hub",
  "/kids-channel/fairy-castles",
  "/kids-channel/certificate-gallery",
  "/kids-academy",
  "/kids-homework",
  "/kids-homework-pricing",
  "/kids-story-creator",
  "/kids-story-pricing",
  "/kids-science-lab",
  "/kids-science-pricing",
  "/kids-drawing-buddy",
  "/kids-drawing-pricing",
  "/kids-reading-companion",
  "/kids-reading-pricing",
  "/kids-voice-chat",
  "/kids-voice-chat-pricing",
  "/kids-pricing",
  "/kids-stories/adventure",
  "/kids-stories/educational",
  "/kids-stories/bedtime",
  "/kids-stories/games",
  "/kids-stories/character-gallery",
];

test.describe("Kids Channel route smoke", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`renders ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status() ?? 200).toBeLessThan(500);
      await waitForHydration(page);
      const body = await page.locator("body").innerText();
      expect(body.length, `body too short on ${path}: "${body.slice(0,80)}"`).toBeGreaterThan(20);
      expect(errors, `JS errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Kids Hub feature slugs", () => {
  for (const slug of HUB_SLUGS) {
    test(`hub/${slug} renders`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`/kids-channel/hub/${slug}`);
      await waitForHydration(page);
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(10);
      expect(errors, `JS errors on /hub/${slug}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Kids Channel legacy redirects", () => {
  test("/kids redirects to /kids-academy", async ({ page }) => {
    await page.goto("/kids");
    await page.waitForURL(/\/kids-academy/, { timeout: 10_000 }).catch(() => {});
    expect(page.url()).toContain("/kids-academy");
  });

  test("disney-castles redirects to fairy-castles", async ({ page }) => {
    await page.goto("/kids-channel/disney-castles");
    await page.waitForURL(/\/kids-channel\/fairy-castles/, { timeout: 10_000 }).catch(() => {});
    expect(page.url()).toContain("/kids-channel/fairy-castles");
  });

  test("disney-castles/:id redirects to fairy-castles/:id", async ({ page }) => {
    await page.goto("/kids-channel/disney-castles/abc123");
    await page.waitForURL(/\/kids-channel\/fairy-castles\/abc123/, { timeout: 10_000 }).catch(() => {});
    expect(page.url()).toContain("/kids-channel/fairy-castles/abc123");
  });
});

test.describe("Kids Channel gated routes", () => {
  for (const path of [
    "/kids-channel/my-gallery",
    "/kids-channel/parental-dashboard",
  ]) {
    test(`${path} requires auth`, async ({ page }) => {
      await page.goto(path);
      await waitForHydration(page);
      // ProtectedRoute either redirects to /auth or renders a sign-in CTA.
      // Poll for either signal — redirect may take a tick after hydration.
      await expect
        .poll(
          async () => {
            const url = page.url();
            const body = (await page.locator("body").innerText()).toLowerCase();
            return url.includes("/auth") || /sign in|log in|prihlás|login|register/i.test(body);
          },
          { timeout: 10_000 },
        )
        .toBe(true);
    });
  }
});
