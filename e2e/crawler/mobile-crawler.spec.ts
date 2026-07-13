/**
 * Mobile crawler — top-priority routes on iPhone 14 + Pixel 7 viewports.
 *
 * Uses the same route list as the full desktop crawler but caps at
 * MOBILE_ROUTE_LIMIT (default 200) and runs each route in both mobile
 * viewports to catch layout/touch bugs the desktop crawler misses.
 *
 * Writes per-device JSON:
 *   e2e/crawler-report/mobile-report.iphone14.json
 *   e2e/crawler-report/mobile-report.pixel7.json
 */
import { test, devices, Page } from "@playwright/test";
import routes from "../../src/utils/smokeTestRoutes.json" assert { type: "json" };
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const REPORT_DIR = "e2e/crawler-report";
const LIMIT = Number(process.env.MOBILE_ROUTE_LIMIT || 200);
const ROUTES = (routes as string[]).slice(0, LIMIT);

type Entry = {
  route: string;
  device: string;
  status: "ok" | "fail";
  pageErrors: string[];
  failedResponses: { url: string; status: number }[];
  loadMs: number;
};

const DEVICES = [
  { name: "iphone14", descriptor: devices["iPhone 14"] ?? devices["iPhone 13"] },
  { name: "pixel7", descriptor: devices["Pixel 7"] ?? devices["Pixel 5"] },
];

for (const dev of DEVICES) {
  test.describe(`Mobile crawler — ${dev.name}`, () => {
    test.use({ ...dev.descriptor });

    test(`crawl ${ROUTES.length} routes on ${dev.name}`, async ({ page }) => {
      test.setTimeout(ROUTES.length * 8_000 + 60_000);
      const results: Entry[] = [];

      for (const route of ROUTES) {
        const pageErrors: string[] = [];
        const failedResponses: { url: string; status: number }[] = [];

        const onErr = (e: Error) => pageErrors.push(e.message);
        const onResp = (r: any) => {
          const s = r.status();
          if (s >= 500) failedResponses.push({ url: r.url(), status: s });
        };
        page.on("pageerror", onErr);
        page.on("response", onResp);

        const start = Date.now();
        let status: "ok" | "fail" = "ok";
        try {
          await page.goto(route, { waitUntil: "domcontentloaded", timeout: 15_000 });
          await page.waitForTimeout(500);
        } catch {
          status = "fail";
        }
        const loadMs = Date.now() - start;

        if (pageErrors.length || failedResponses.length) status = "fail";

        results.push({ route, device: dev.name, status, pageErrors, failedResponses, loadMs });
        page.off("pageerror", onErr);
        page.off("response", onResp);
      }

      const outPath = `${REPORT_DIR}/mobile-report.${dev.name}.json`;
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(
        outPath,
        JSON.stringify(
          {
            device: dev.name,
            total: results.length,
            failed: results.filter((r) => r.status === "fail").length,
            results,
          },
          null,
          2,
        ),
      );
    });
  });
}
