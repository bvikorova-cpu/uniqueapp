import { test, expect } from "@playwright/test";

const routes = [
  "/wellness",
  "/safety-prevention",
  "/psychologist",
  "/online-psychologist",
  "/teen-mental-wellness",
  "/fitness-wellness",
  "/nutrition-hub",
  "/nutrition-subscriptions",
  "/healthcare",
  "/healthcare-dashboard",
  "/healthcare-library",
];

for (const path of routes) {
  test(`health & wellness route ${path} renders without runtime error`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.status() ?? 0).toBeLessThan(500);

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await expect(page.locator("body")).toBeVisible();

    const fatal = errors.filter(
      (e) => !/google|translate|favicon|sw\.js|service-worker|net::ERR_|ResizeObserver/i.test(e),
    );
    expect(fatal, `Fatal errors on ${path}:\n${fatal.join("\n")}`).toEqual([]);
  });
}
