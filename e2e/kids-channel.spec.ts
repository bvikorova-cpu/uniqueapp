import { test, expect } from "@playwright/test";

/**
 * Kids Channel E2E — verifies that every Kids Channel route renders without
 * crashing, public hubs are reachable, gated hubs redirect to auth, and the
 * Disney → Fairy Castles legacy redirects still work.
 *
 * No login required; tests assert: (a) the page loads under 500, (b) no JS
 * exceptions are thrown during initial paint, (c) body contains some text.
 */

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
      await page.waitForLoadState("domcontentloaded");
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(20);
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
      await page.waitForLoadState("domcontentloaded");
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(10);
      expect(errors, `JS errors on /hub/${slug}:\n${errors.join("\n")}`).toEqual([]);
    });
  }
});

test.describe("Kids Channel legacy redirects", () => {
  test("/kids redirects to /kids-academy", async ({ page }) => {
    await page.goto("/kids");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/kids-academy");
  });

  test("disney-castles redirects to fairy-castles", async ({ page }) => {
    await page.goto("/kids-channel/disney-castles");
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/kids-channel/fairy-castles");
  });

  test("disney-castles/:id redirects to fairy-castles/:id", async ({ page }) => {
    await page.goto("/kids-channel/disney-castles/abc123");
    await page.waitForLoadState("domcontentloaded");
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
      await page.waitForLoadState("domcontentloaded");
      // ProtectedRoute should either redirect to /auth or render a sign-in CTA
      const url = page.url();
      const body = (await page.locator("body").innerText()).toLowerCase();
      const gated = url.includes("/auth") || /sign in|log in|prihlás|login/i.test(body);
      expect(gated).toBe(true);
    });
  }
});
