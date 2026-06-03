import { test, expect } from "@playwright/test";

/**
 * Cross-browser overenie (chromium / firefox / webkit):
 *   A) Autoplay policy: AudioContext začína "suspended". Po reálnej notifikácii
 *      sa playNotificationChime pokúsi prehrať → resume() musí byť volaný.
 *      Po user-gesture sa stav prepne na "running".
 *   B) Permission-denied: AudioContext konštruktor hodí — appka nesmie spadnúť
 *      (žiadne unhandled page errory), realtime tok pokračuje.
 *
 * Cross-browser: aktivuj firefox/webkit cez PLAYWRIGHT_ENABLE_CROSS_BROWSER=1.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

test.describe.configure({ retries: 2 });

async function getSession(page: any) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!key) return null;
    const raw = localStorage.getItem(key);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
}

async function insertNotification(page: any, userId: string, accessToken: string) {
  return page.request.post(`${SUPABASE_URL}/rest/v1/notifications`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    data: {
      user_id: userId,
      type: "like",
      title: "E2E autoplay probe",
      message: "Playwright autoplay/permission probe",
    },
  });
}

test("A) suspended AudioContext: resume sa zavolá pri reálnej notifikácii a user-gesture", async ({ page, browserName }) => {
  test.setTimeout(90_000);

  await page.addInitScript(() => {
    (window as any).__resumeCalls = 0;
    (window as any).__chimeStarts = 0;
    (window as any).__acState = "suspended";
    class FakeOsc {
      type = "sine";
      frequency = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      connect() { return { connect() { return {}; } }; }
      start() { (window as any).__chimeStarts++; }
      stop() {}
    }
    class FakeGain {
      gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      connect() { return { connect() { return {}; } }; }
    }
    class FakeAC {
      state = "suspended";
      currentTime = 0;
      destination = {};
      createOscillator() { return new FakeOsc(); }
      createGain() { return new FakeGain(); }
      resume() {
        (window as any).__resumeCalls++;
        this.state = "running";
        (window as any).__acState = "running";
        return Promise.resolve();
      }
    }
    (window as any).AudioContext = FakeAC;
    (window as any).webkitAudioContext = FakeAC;
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const session = await getSession(page);
  expect(session?.access_token, `[${browserName}] missing session`).toBeTruthy();

  // User gesture odomyká audio v reálnych prehliadačoch (Safari/FF najmä).
  await page.mouse.click(15, 15);
  await page.waitForTimeout(2500);

  const res = await insertNotification(page, session.user.id, session.access_token);
  if (!res.ok()) {
    test.info().annotations.push({
      type: "soft-skip",
      description: `[${browserName}] insert blocked: ${res.status()}`,
    });
    test.skip(true, "RLS blocked notification insert");
    return;
  }

  await expect
    .poll(() => page.evaluate(() => (window as any).__resumeCalls ?? 0), {
      timeout: 15_000,
      intervals: [250, 500, 1000],
    })
    .toBeGreaterThan(0);

  const state = await page.evaluate(() => (window as any).__acState);
  expect(state, `[${browserName}] AudioContext sa nepreniesol do running`).toBe("running");
});

test("B) AudioContext konštruktor throw → app nespadne, žiadne unhandled errors", async ({ page, browserName }) => {
  test.setTimeout(90_000);

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
  await page.waitForTimeout(1500);

  const session = await getSession(page);
  expect(session?.access_token, `[${browserName}] missing session`).toBeTruthy();

  await page.mouse.click(20, 20);
  await page.keyboard.press("Tab").catch(() => {});
  await page.waitForTimeout(2000);

  const res = await insertNotification(page, session.user.id, session.access_token);
  if (!res.ok()) {
    test.info().annotations.push({
      type: "soft-skip",
      description: `[${browserName}] insert blocked: ${res.status()}`,
    });
    test.skip(true, "RLS blocked notification insert");
    return;
  }

  // Daj čas realtime payloadu prebehnúť cez chime cestu.
  await page.waitForTimeout(4000);

  // Heuristika: chime/audio errors nesmú uniknúť ako unhandled.
  const chimeErrors = pageErrors.filter((e) =>
    /chime|audiocontext|NotAllowedError|audio denied/i.test(e),
  );
  expect(chimeErrors, `[${browserName}] unhandled audio errors: ${chimeErrors.join("; ")}`).toEqual([]);

  // App musí ďalej fungovať — DOM je interaktívny.
  await expect(page.locator("body")).toBeVisible();
});
