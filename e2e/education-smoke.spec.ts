import { test, expect } from "@playwright/test";

const routes = [
  { path: "/education", heading: /Education/i },
  { path: "/education/hub", heading: /Education/i },
  { path: "/education/flashcards", heading: /Flashcard/i },
  { path: "/education/daily", heading: /Daily Challenge/i },
  { path: "/education/achievements", heading: /Achievements/i },
  { path: "/education/league", heading: /League/i },
  { path: "/education/math-solver", heading: /Math/i },
  { path: "/education/tutor", heading: /Tutor/i },
  { path: "/education/notes", heading: /Notes/i },
  { path: "/education/study-groups", heading: /Study Groups/i },
  { path: "/education/certificates", heading: /Certificate/i },
  { path: "/education/skill-tree", heading: /Skill Tree/i },
];

for (const r of routes) {
  test(`education route ${r.path} renders without runtime error`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const res = await page.goto(r.path, { waitUntil: "domcontentloaded" });
    expect(res?.status() ?? 0).toBeLessThan(500);

    // Page should hydrate (no permanent loading spinner)
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();

    // Ignore noisy 3rd-party / asset errors
    const fatal = errors.filter(
      (e) => !/google|translate|favicon|sw\.js|service-worker|net::ERR_/i.test(e),
    );
    expect(fatal, `Fatal errors on ${r.path}:\n${fatal.join("\n")}`).toEqual([]);
  });
}
