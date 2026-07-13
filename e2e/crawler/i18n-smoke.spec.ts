/**
 * i18n smoke — for each of the 12 supported languages, switches
 * `preferred_language` in localStorage, reloads a set of critical
 * routes, and reports any missing i18n keys (surfaced via the
 * missingKeyHandler that logs `[i18n] Missing key "..."`).
 *
 * Writes e2e/crawler-report/i18n-report.json with per-language counts.
 */
import { test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const LANGS = ["en", "sk", "cs", "de", "es", "fr", "it", "hu", "ru", "ja", "ko", "zh"];
const ROUTES = [
  "/",
  "/wall",
  "/megatalent",
  "/dating",
  "/jobs",
  "/bazaar",
  "/education",
  "/health",
  "/kids",
  "/creators",
  "/pricing",
  "/rewards",
];

type LangResult = {
  lang: string;
  missingKeys: string[];
  routesWithErrors: { route: string; errors: string[] }[];
};

test("i18n smoke across 12 languages", async ({ page }) => {
  test.setTimeout(LANGS.length * ROUTES.length * 6_000 + 60_000);
  const results: LangResult[] = [];

  for (const lang of LANGS) {
    const missingKeys = new Set<string>();
    const routesWithErrors: { route: string; errors: string[] }[] = [];

    await page.goto("/", { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.evaluate((l) => {
      try {
        localStorage.setItem("preferred_language", l);
        localStorage.setItem("i18nextLng", l);
      } catch {}
    }, lang);

    for (const route of ROUTES) {
      const errs: string[] = [];
      const onConsole = (msg: any) => {
        const text = msg.text?.() ?? "";
        const m = text.match(/\[i18n\] Missing key "([^"]+)"/);
        if (m) {
          missingKeys.add(m[1]);
          errs.push(m[1]);
        }
      };
      const onErr = (e: Error) => errs.push(`pageerror: ${e.message}`);
      page.on("console", onConsole);
      page.on("pageerror", onErr);

      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 12_000 }).catch(() => {});
      await page.waitForTimeout(600);

      page.off("console", onConsole);
      page.off("pageerror", onErr);

      if (errs.length) routesWithErrors.push({ route, errors: errs.slice(0, 10) });
    }

    results.push({
      lang,
      missingKeys: Array.from(missingKeys).slice(0, 200),
      routesWithErrors,
    });
  }

  mkdirSync("e2e/crawler-report", { recursive: true });
  writeFileSync(
    "e2e/crawler-report/i18n-report.json",
    JSON.stringify(
      {
        total: LANGS.length,
        summary: results.map((r) => ({
          lang: r.lang,
          missingCount: r.missingKeys.length,
          routesFailed: r.routesWithErrors.length,
        })),
        results,
      },
      null,
      2,
    ),
  );
});
