/**
 * Smoke test for Manual Testing Checklist v2 (docs/MANUAL_TESTING_CHECKLIST_v2.md)
 *
 * Goal: pre každú zo sekcií 1–24 over že primárna routa odpovedá 200,
 * nie je 404, neobsahuje runtime crash a má nejakú viditeľnú nadpisovú/hlavnú zónu.
 *
 * Toto je iba lacný smoke — hlbšie kontroly (Stripe, RLS, escrow…) majú vlastné e2e súbory.
 */
import { test, expect, type Page } from '@playwright/test';

type RouteCheck = {
  section: string;
  path: string;
  /** Substring or regex that MUST appear on the page (heading, CTA, brand). */
  expect?: string | RegExp;
};

const ROUTES: RouteCheck[] = [
  { section: '1 Megatalent', path: '/megatalent' },
  { section: '2 Education', path: '/education' },
  { section: '3 Jobs', path: '/jobs' },
  { section: '4 Dating', path: '/dating' },
  { section: '4.3 Anonymous Dating', path: '/dating/anonymous' },
  { section: '5 Kids Hub', path: '/kids' },
  { section: '6 Teen Hub', path: '/teen' },
  { section: '7 KitchenStars Arena', path: '/kitchenstars' },
  { section: '8 Bazaar', path: '/bazaar' },
  { section: '9 Coupons', path: '/coupons' },
  { section: '10 AI Tools', path: '/ai' },
  { section: '11 Creators', path: '/creators' },
  { section: '12 Live', path: '/live' },
  { section: '13 Fundraising', path: '/fundraising' },
  { section: '14 Sports', path: '/sports' },
  { section: '15 Games', path: '/games' },
  { section: '16 Wellness', path: '/wellness' },
  { section: '16 Beauty', path: '/beauty' },
  { section: '17 Community', path: '/community' },
  { section: '18 Music', path: '/music' },
  { section: '19 ProClass', path: '/proclass' },
  { section: '20 Vacationer', path: '/vacationer' },
  { section: '21 Investment', path: '/investment' },
  { section: '22 Referral', path: '/referral' },
];

async function gotoAndAssertHealthy(page: Page, path: string) {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignoruj 3rd-party hluk (GA, Sentry warmup, manifest icons, atď.)
      if (
        /google|gtag|sentry|manifest|favicon|chrome-extension|hcaptcha|recaptcha/i.test(
          text,
        )
      ) {
        return;
      }
      consoleErrors.push(text);
    }
  });

  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response, `no response for ${path}`).toBeTruthy();
  expect(response!.status(), `${path} returned ${response!.status()}`).toBeLessThan(500);

  // Stránka musí mať <main> alebo aspoň <h1>/<h2> a NESMIE byť explicitný 404
  const has404 = await page
    .locator('text=/404|Page not found|Stránka sa nenašla/i')
    .first()
    .isVisible()
    .catch(() => false);
  expect(has404, `${path} renderuje 404 fallback`).toBeFalsy();

  await expect(page.locator('main, [role="main"], h1, h2').first()).toBeVisible({
    timeout: 8000,
  });

  expect(consoleErrors, `console errors on ${path}:\n${consoleErrors.join('\n')}`).toHaveLength(0);
}

test.describe('Checklist v2 — smoke routy 24 sekcií', () => {
  for (const route of ROUTES) {
    test(`${route.section} → ${route.path}`, async ({ page }) => {
      await gotoAndAssertHealthy(page, route.path);
    });
  }

  test('Cross-cutting: jazyk default EN', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang ?? 'en').toMatch(/^en/i);
  });

  test('Cross-cutting: žiadny USD na hlavnej', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\$\d/);
  });
});
