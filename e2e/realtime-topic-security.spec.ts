/**
 * Realtime topic security — LIVE end-to-end check
 * -----------------------------------------------
 * Connects to the real Supabase Realtime backend (using the anon
 * publishable key) as an UNAUTHENTICATED client and asserts that the RLS
 * policies on `realtime.messages` deny subscriptions to broad / sensitive
 * topics. This catches regressions introduced by accidentally widening a
 * policy or granting `anon` privileges on the realtime schema.
 *
 * Topics tested:
 *   ❌ public:messages
 *   ❌ anonymous_dating_messages
 *   ❌ user:<random-uuid>
 *
 * For each, an unauthenticated subscribe must NOT resolve to "SUBSCRIBED"
 * within the timeout window — it should land on CHANNEL_ERROR / CLOSED /
 * TIMED_OUT.
 *
 * Run via:  bunx playwright test e2e/realtime-topic-security.spec.ts
 */
import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q";

async function trySubscribe(
  page: import("@playwright/test").Page,
  topic: string,
  timeoutMs = 5000,
): Promise<string> {
  // Run inside the browser context where @supabase/supabase-js is bundled
  // by the app (we navigate to "/" first to load the SPA / its supabase client).
  return page.evaluate(
    async ({ url, key, topic, timeoutMs }) => {
      // @ts-expect-error — load supabase-js from CDN inside the page
      const mod = await import("https://esm.sh/@supabase/supabase-js@2");
      const client = mod.createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      // Ensure no session
      await client.auth.signOut().catch(() => {});

      return await new Promise<string>((resolve) => {
        const ch = client.channel(topic);
        const timer = setTimeout(() => {
          client.removeChannel(ch);
          resolve("TIMED_OUT");
        }, timeoutMs);
        ch.subscribe((status: string) => {
          clearTimeout(timer);
          client.removeChannel(ch);
          resolve(status);
        });
      });
    },
    { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, topic, timeoutMs },
  );
}

test.describe("Realtime topic security (live)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("anon cannot subscribe to public:messages", async ({ page }) => {
    const status = await trySubscribe(page, "public:messages");
    expect(status, `unexpected status for public:messages: ${status}`).not.toBe("SUBSCRIBED");
  });

  test("anon cannot subscribe to anonymous_dating_messages", async ({ page }) => {
    const status = await trySubscribe(page, "anonymous_dating_messages");
    expect(status).not.toBe("SUBSCRIBED");
  });

  test("anon cannot subscribe to a random user-scoped topic", async ({ page }) => {
    const status = await trySubscribe(page, "user:00000000-0000-0000-0000-000000000099");
    expect(status).not.toBe("SUBSCRIBED");
  });
});
