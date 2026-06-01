import { test, expect } from "@playwright/test";

/**
 * Verify Megatalent, Bazaar and Admin routes render no Slovak strings.
 * Detects diacritics and common Slovak words (with/without diacritics).
 */

const SLOVAK_DIACRITICS = /[áäčďéíĺľňóôŕšťúýžÁČĎÉÍĽŇÔŠŤÚÝŽ]/;
const SLOVAK_WORDS = /\b(prosím|chyba|úspeš|nepodarilo|načít|prihlás|odhlás|zobrazi[ťt]|pridať|zruši[ťt]|odosla[ťt]|nastaven|používateľ|kategória|hlasovať|stiahnu|nahra[ťt]|potvrdi[ťt]|pokračova[ťt]|skúste|znova|späť|ďakuj|názov|cena|popis|dátum|vyhľad|filtrova|spravova|schvál|zamietnu|vytvori[ťt]|vymaza[ťt]|upravi[ťt]|kreditov|peniaze|vyplat|zaplat|kúpi[ťt]|predáv|inzerát|bazár|súťaž|talent)\b/i;

const ROUTES = [
  "/megatalent",
  "/megatalent/battle-results",
  "/bazaar",
  "/admin",
  "/admin/credits-ledger",
];

for (const route of ROUTES) {
  test(`${route} renders English text only`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    // Skip auth/redirect pages — they're not what we're auditing
    if (resp && resp.status() >= 400) test.skip(true, `route ${route} -> ${resp.status()}`);

    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    const text = (await page.locator("body").innerText().catch(() => "")) || "";

    // Skip if route gated to login (we're not authed in default project)
    if (/sign in|log in|prihlás/i.test(text) && text.length < 800) {
      test.skip(true, `${route} requires auth`);
    }

    const diacriticMatch = text.match(SLOVAK_DIACRITICS);
    const wordMatch = text.match(SLOVAK_WORDS);

    expect(
      diacriticMatch,
      `Slovak diacritic on ${route}: "${diacriticMatch?.[0]}" near "${text.slice(Math.max(0, (diacriticMatch?.index ?? 0) - 40), (diacriticMatch?.index ?? 0) + 60)}"`,
    ).toBeNull();

    expect(
      wordMatch,
      `Slovak word on ${route}: "${wordMatch?.[0]}"`,
    ).toBeNull();
  });
}
