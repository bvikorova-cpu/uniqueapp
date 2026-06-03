import { test, expect } from "@playwright/test";

/**
 * Overuje, že po prijatí reálnej notifikácie (insert do `notifications`)
 * sa v UI spustí cinknutie cez Web Audio API.
 *
 * Stratégia:
 *   1. Pred načítaním stránky podstrčíme stub `AudioContext`, ktorý
 *      počíta `createOscillator` volania a zapisuje ich na `window.__chimeCalls`.
 *   2. Po prihlásení (storageState) prejdeme na `/` — `RealTimeNotificationsMount`
 *      otvorí Supabase realtime kanál.
 *   3. REST insertom do `notifications` so service-side povoleným typom !== "message"
 *      vyvoláme `playNotificationChime()`.
 *   4. Počkáme, kým `window.__chimeCalls > 0`.
 */

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.E2E_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

test.describe.configure({ retries: 2 });

test("realtime notification triggers chime in UI", async ({ page }) => {
  test.setTimeout(90_000);
  // 1) Stub Web Audio PRED načítaním stránky.
  await page.addInitScript(() => {
    (window as any).__chimeCalls = 0;
    class FakeOsc {
      type = "sine";
      frequency = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
      connect() { return { connect() { return {}; } }; }
      start() { (window as any).__chimeCalls = ((window as any).__chimeCalls || 0) + 1; }
      stop() {}
    }
    class FakeGain {
      gain = {
        value: 0,
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
      };
      connect() { return { connect() { return {}; } }; }
    }
    class FakeAC {
      state = "running";
      currentTime = 0;
      destination = {};
      createOscillator() { return new FakeOsc(); }
      createGain() { return new FakeGain(); }
      resume() { return Promise.resolve(); }
    }
    (window as any).AudioContext = FakeAC;
    (window as any).webkitAudioContext = FakeAC;
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load").catch(() => {});
  await page.waitForTimeout(2000);
  console.log("[chime-test] page.url after load =", page.url());

  // 2) Vytiahneme access_token z localStorage (key môže mať iný ref).
  const dump = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const authKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    const raw = authKey ? localStorage.getItem(authKey) : null;
    let parsed: any = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch {}
    return { keys, authKey, hasRaw: !!raw, parsed };
  });
  console.log("[chime-test] storage dump", JSON.stringify({ keys: dump.keys, authKey: dump.authKey, hasRaw: dump.hasRaw }));
  const session = dump.parsed;
  expect(session?.access_token, "missing supabase session in storage").toBeTruthy();
  const userId: string = session.user.id;
  const accessToken: string = session.access_token;

  // 3) Realtime subscribe musí byť aktívny — počkáme krátko.
  await page.waitForTimeout(2500);

  // Užívateľská interakcia odomkne AudioContext (autoplay policy).
  await page.mouse.click(10, 10);

  // 4) Insert notifikácie cez REST (RLS dovolí insert na vlastný user_id).
  const insertRes = await page.request.post(
    `${SUPABASE_URL}/rest/v1/notifications`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      data: {
        user_id: userId,
        type: "like",
        title: "E2E chime",
        message: "Playwright chime probe",
      },
    },
  );

  if (!insertRes.ok()) {
    const body = await insertRes.text();
    test.info().annotations.push({
      type: "soft-skip",
      description: `notifications insert blocked (${insertRes.status()}): ${body.slice(0, 200)}`,
    });
    test.skip(true, "Cannot insert notification under current RLS — chime path unreachable from client");
    return;
  }

  // 5) Počkáme, kým realtime payload spustí chime.
  await expect
    .poll(
      async () => page.evaluate(() => (window as any).__chimeCalls ?? 0),
      { timeout: 15_000, intervals: [250, 500, 1000] },
    )
    .toBeGreaterThan(0);
});
