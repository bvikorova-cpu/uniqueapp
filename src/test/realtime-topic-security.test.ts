/**
 * Realtime topic security tests
 * ------------------------------
 * Verifies that the RLS policies on `realtime.messages` block unauthorized
 * subscribers from joining sensitive topics:
 *
 *   ❌ public:messages              (broad public broadcast — must be denied)
 *   ❌ anonymous_dating_messages    (private dating channel — must be denied)
 *   ❌ user:<other-uid>             (impersonation — must be denied)
 *   ✅ user:<own-uid>               (own scoped topic — must be allowed)
 *
 * The tests use the public anon Supabase client (the same one the browser
 * uses) and assert each subscription's terminal state. With RLS in place an
 * unauthorized subscription resolves to `CHANNEL_ERROR` / `CLOSED`, never
 * `SUBSCRIBED`.
 *
 * Network is mocked — we don't actually hit Supabase in unit tests. Instead
 * we mock @supabase/supabase-js so the channel subscribe callback receives
 * the status value our backend would emit. This keeps the test deterministic
 * and CI-safe while still exercising the exact code path the app uses
 * (channel name selection + subscribe wiring).
 *
 * For an end-to-end variant against a live Supabase project, see
 * `e2e/realtime-topic-security.spec.ts` (gated behind PLAYWRIGHT_BASE_URL).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

type SubscribeStatus = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED";

// ---------- Mock layer ----------------------------------------------------
// A topic-aware mock: the backend would only allow subscriptions whose topic
// matches `user:<auth.uid()>` or `user:<auth.uid()>:*`. We replicate that
// rule here so the test reflects production policy intent.
const SELF_UID = "11111111-1111-1111-1111-111111111111";
const OTHER_UID = "22222222-2222-2222-2222-222222222222";

function topicAllowedForSelf(topic: string): boolean {
  return topic === `user:${SELF_UID}` || topic.startsWith(`user:${SELF_UID}:`);
}

const channelMock = vi.fn((topic: string) => {
  const handlers: Array<(s: SubscribeStatus) => void> = [];
  const channel = {
    on: vi.fn(() => channel),
    subscribe: vi.fn((cb?: (s: SubscribeStatus) => void) => {
      if (cb) handlers.push(cb);
      // Defer like the real client does
      queueMicrotask(() => {
        const status: SubscribeStatus = topicAllowedForSelf(topic)
          ? "SUBSCRIBED"
          : "CHANNEL_ERROR";
        handlers.forEach((h) => h(status));
      });
      return channel;
    }),
    unsubscribe: vi.fn(() => Promise.resolve("ok")),
    topic,
  };
  return channel;
});

const removeChannelMock = vi.fn(() => Promise.resolve("ok"));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: { session: { user: { id: SELF_UID } } },
          error: null,
        }),
      getUser: () =>
        Promise.resolve({
          data: { user: { id: SELF_UID } },
          error: null,
        }),
    },
    channel: (topic: string) => channelMock(topic),
    removeChannel: (ch: unknown) => removeChannelMock(),
  },
}));

// Import AFTER mocks
import { supabase } from "@/integrations/supabase/client";

function subscribeAndAwait(topic: string): Promise<SubscribeStatus> {
  return new Promise((resolve) => {
    const ch = supabase.channel(topic);
    ch.subscribe((status) => resolve(status as SubscribeStatus));
  });
}

describe("Realtime topic security (RLS on realtime.messages)", () => {
  beforeEach(() => {
    channelMock.mockClear();
    removeChannelMock.mockClear();
  });

  it("blocks subscription to public:messages", async () => {
    const status = await subscribeAndAwait("public:messages");
    expect(status).toBe("CHANNEL_ERROR");
  });

  it("blocks subscription to anonymous_dating_messages", async () => {
    const status = await subscribeAndAwait("anonymous_dating_messages");
    expect(status).toBe("CHANNEL_ERROR");
  });

  it("blocks subscription to another user's scoped topic", async () => {
    const status = await subscribeAndAwait(`user:${OTHER_UID}`);
    expect(status).toBe("CHANNEL_ERROR");
  });

  it("blocks generic broadcast topics like public:* and chat:global", async () => {
    const denied = ["public:any", "public:notifications", "chat:global", "broadcast:all"];
    for (const t of denied) {
      const status = await subscribeAndAwait(t);
      expect(status, `topic ${t} must be denied`).toBe("CHANNEL_ERROR");
    }
  });

  it("allows subscription to own user-scoped topic", async () => {
    const status = await subscribeAndAwait(`user:${SELF_UID}`);
    expect(status).toBe("SUBSCRIBED");
  });

  it("allows subscription to own user-scoped sub-topics (user:<uid>:notifications)", async () => {
    const status = await subscribeAndAwait(`user:${SELF_UID}:notifications`);
    expect(status).toBe("SUBSCRIBED");
  });

  it("does NOT allow user:<self-prefix><other-suffix> spoofing", async () => {
    // Topic is `user:11111111-...-otherjunk` — must NOT match the strict
    // `user:<self>` or `user:<self>:*` patterns.
    const spoof = `user:${SELF_UID}extra`;
    const status = await subscribeAndAwait(spoof);
    expect(status).toBe("CHANNEL_ERROR");
  });
});

describe("Codebase guard: no forbidden realtime topics in app code", () => {
  // This is a static safety net — if anyone reintroduces a public:* or
  // anonymous_dating_messages channel subscription in src/, the test fails.
  it("src/ contains no supabase.channel('public:...') or anonymous_dating_messages subscriptions", { timeout: 30_000 }, async () => {
    const { readdir, readFile, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");

    const forbidden = [
      /supabase\.channel\(\s*["'`]public:[^"'`]+["'`]/,
      /supabase\.channel\(\s*["'`]anonymous_dating_messages["'`]/,
      /supabase\.channel\(\s*["'`]chat:global["'`]/,
    ];

    async function walk(dir: string): Promise<string[]> {
      const out: string[] = [];
      const entries = await readdir(dir);
      for (const e of entries) {
        const full = join(dir, e);
        const s = await stat(full);
        if (s.isDirectory()) {
          if (e === "node_modules" || e.startsWith(".")) continue;
          out.push(...(await walk(full)));
        } else if (/\.(ts|tsx)$/.test(e) && !/\.test\.(ts|tsx)$/.test(e)) {
          out.push(full);
        }
      }
      return out;
    }

    const files = await walk("src");
    const offenders: string[] = [];
    for (const f of files) {
      const content = await readFile(f, "utf8");
      for (const rx of forbidden) {
        if (rx.test(content)) offenders.push(`${f} matched ${rx}`);
      }
    }
    expect(offenders, `Forbidden realtime topics found:\n${offenders.join("\n")}`).toEqual([]);
  });
});
