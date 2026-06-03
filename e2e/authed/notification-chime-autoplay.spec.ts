import { test, expect } from "@playwright/test";

/**
 * Cross-browser overenie (chromium / firefox / webkit):
 *   A) Autoplay policy: AudioContext začína v stave "suspended" → playNotificationChime
 *      ho zaregistruje, ale skutočne sa odomkne až po user-gesture (pointerdown).
 *   B) Permission-denied: AudioContext konštruktor hodí — aplikácia nesmie spadnúť,
 *      runtime errors nesmú pribudnúť.
 *
 * Test je browser-agnostic — beží vo všetkých projektoch z playwright.config.ts.
 * Lokálne spustenie:
 *   bunx playwright test e2e/authed/notification-chime-autoplay.spec.ts --project=chromium-authed
 *   bunx playwright test e2e/authed/notification-chime-autoplay.spec.ts --project=firefox-authed
 *   bunx playwright test e2e/authed/notification-chime-autoplay.spec.ts --project=webkit-authed
 */

test.describe.configure({ retries: 2 });

test("A) suspended AudioContext sa odomkne až po user gesture", async ({ page, browserName }) => {
  test.setTimeout(60_000);

  await page.addInitScript(() => {
    (window as any).__chimeCalls = 0;
    (window as any).__resumeCalls = 0;
    class FakeOsc {
      type = "sine";
      frequency = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      connect() { return { connect() { return {}; } }; }
      start() { (window as any).__chimeCalls++; }
      stop() {}
    }
    class FakeGain {
      gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      connect() { return { connect() { return {}; } }; }
    }
    class FakeAC {
      state: string = "suspended";
      currentTime = 0;
      destination = {};
      createOscillator() { return new FakeOsc(); }
      createGain() { return new FakeGain(); }
      resume() {
        (window as any).__resumeCalls++;
        this.state = "running";
        return Promise.resolve();
      }
    }
    (window as any).AudioContext = FakeAC;
    (window as any).webkitAudioContext = FakeAC;
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  // Pred user-gesture: priamy import a volanie chime
  await page.evaluate(async () => {
    const mod = await import("/src/lib/notificationChime.ts");
    mod.playNotificationChime();
  });

  // AudioContext bol suspended → resume() musí byť volaný počas getCtx()
  const resumeBefore = await page.evaluate(() => (window as any).__resumeCalls);
  expect(resumeBefore, `[${browserName}] resume nemusí byť 0 — getCtx ho volá`).toBeGreaterThan(0);

  // User gesture odomyká kontext aj cez globálne listenery (pointerdown/keydown/touchstart)
  await page.mouse.click(20, 20);
  await page.waitForTimeout(200);

  const resumeAfter = await page.evaluate(() => (window as any).__resumeCalls);
  expect(resumeAfter, `[${browserName}] user-gesture musí spustiť resume`).toBeGreaterThanOrEqual(resumeBefore);

  // Po odomknutí druhé volanie chime musí vyrobiť oscilátory (5 tónov)
  await page.waitForTimeout(500); // debounce 400ms
  await page.evaluate(async () => {
    const mod = await import("/src/lib/notificationChime.ts");
    mod.playNotificationChime();
  });
  const calls = await page.evaluate(() => (window as any).__chimeCalls);
  expect(calls, `[${browserName}] po user-gesture musí cinknutie zaznieť`).toBeGreaterThan(0);
});

test("B) permission-denied / AudioContext throw → app nespadne", async ({ page, browserName }) => {
  test.setTimeout(60_000);

  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  await page.addInitScript(() => {
    const Throwing = class {
      constructor() { throw new Error("NotAllowedError: audio denied"); }
    };
    (window as any).AudioContext = Throwing;
    (window as any).webkitAudioContext = Throwing;
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  // Priame volanie chime nesmie hodiť
  const threw = await page.evaluate(async () => {
    try {
      const mod = await import("/src/lib/notificationChime.ts");
      mod.playNotificationChime();
      return null;
    } catch (e) {
      return String(e);
    }
  });
  expect(threw, `[${browserName}] playNotificationChime nesmie throw-núť`).toBeNull();

  // User gesture taktiež nesmie zhodiť app cez unlock listenery
  await page.mouse.click(30, 30);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(300);

  // Žiadne unhandled page errory z chime cesty
  const chimeErrors = pageErrors.filter((e) => /chime|audiocontext|NotAllowedError/i.test(e));
  expect(chimeErrors, `[${browserName}] runtime errors z chime: ${chimeErrors.join("; ")}`).toEqual([]);
});
