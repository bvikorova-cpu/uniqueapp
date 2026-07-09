/**
 * Megatalent voting — realtime topic authorization tests
 * ------------------------------------------------------
 * Megatalent voting and submission updates are pushed to user-scoped
 * Realtime topics so each user only receives their own vote tallies,
 * notifications, and unlocks. The contract enforced by the RLS policies on
 * `realtime.messages` is:
 *
 *   ✅ authenticated user MAY subscribe to:
 *        user:<own-uid>
 *        user:<own-uid>:megatalent
 *        user:<own-uid>:megatalent:votes
 *        user:<own-uid>:megatalent:submission:<id>
 *
 *   ❌ MUST be rejected (regardless of who is asking):
 *        public:megatalent
 *        megatalent:votes
 *        megatalent:global
 *        user:<other-uid>:megatalent              (impersonation)
 *        user:<other-uid>:megatalent:votes        (impersonation)
 *
 *   ❌ Anonymous (unauthenticated) clients MUST be rejected on EVERY topic,
 *        including topics shaped like `user:<uid>:megatalent:*`.
 *
 * The Supabase client is mocked so the test deterministically reflects the
 * RLS policy intent without hitting the network. A live counterpart that
 * exercises the real backend lives at
 * `e2e/realtime-topic-security.spec.ts`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

type SubscribeStatus = "SUBSCRIBED" | "CHANNEL_ERROR" | "TIMED_OUT" | "CLOSED";

const SELF_UID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const OTHER_UID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

// ---------------------------------------------------------------------------
// Session toggle — flipped per test to simulate authenticated vs anon clients
// ---------------------------------------------------------------------------
let currentSession: { user: { id: string } } | null = null;

function topicAllowedFor(uid: string | null, topic: string): boolean {
  // Anon → always denied
  if (!uid) return false;
  // Strict scope: user:<uid> or user:<uid>:<anything>
  return topic === `user:${uid}` || topic.startsWith(`user:${uid}:`);
}

const channelMock = vi.fn((topic: string) => {
  const handlers: Array<(s: SubscribeStatus) => void> = [];
  const channel = {
    on: vi.fn(() => channel),
    subscribe: vi.fn((cb?: (s: SubscribeStatus) => void) => {
      if (cb) handlers.push(cb);
      queueMicrotask(() => {
        const uid = currentSession?.user?.id ?? null;
        const status: SubscribeStatus = topicAllowedFor(uid, topic)
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

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: currentSession }, error: null }),
      getUser: () =>
        Promise.resolve({
          data: { user: currentSession?.user ?? null },
          error: currentSession ? null : { message: "not authenticated" },
        }),
    },
    channel: (topic: string) => channelMock(topic),
    removeChannel: () => Promise.resolve("ok"),
  },
}));

import { supabase } from "@/integrations/supabase/client";

function subscribeAndAwait(topic: string): Promise<SubscribeStatus> {
  return new Promise((resolve) => {
    const ch = supabase.channel(topic);
    ch.subscribe((status) => resolve(status as SubscribeStatus));
  });
}

beforeEach(() => {
  channelMock.mockClear();
  currentSession = null;
});

// ---------------------------------------------------------------------------
// Anonymous (unauthenticated) clients
// ---------------------------------------------------------------------------
describe("Megatalent voting topics — anon (unauthenticated) clients", () => {
  beforeEach(() => {
    currentSession = null; // explicit
  });

  const denied = [
    `user:${SELF_UID}`,
    `user:${SELF_UID}:megatalent`,
    `user:${SELF_UID}:megatalent:votes`,
    `user:${SELF_UID}:megatalent:submission:42`,
    `user:${OTHER_UID}:megatalent`,
    "public:megatalent",
    "megatalent:votes",
    "megatalent:global",
    "broadcast:megatalent",
  ];

  for (const topic of denied) {
    it(`rejects anon subscription to ${topic}`, async () => {
      const status = await subscribeAndAwait(topic);
      expect(status).toBe("CHANNEL_ERROR");
    });
  }
});

// ---------------------------------------------------------------------------
// Authenticated clients — own scope is allowed
// ---------------------------------------------------------------------------
describe("Megatalent voting topics — authenticated user, own scope", () => {
  beforeEach(() => {
    currentSession = { user: { id: SELF_UID } };
  });

  const allowed = [
    `user:${SELF_UID}`,
    `user:${SELF_UID}:megatalent`,
    `user:${SELF_UID}:megatalent:votes`,
    `user:${SELF_UID}:megatalent:submission:abc-123`,
    `user:${SELF_UID}:megatalent:notifications`,
  ];

  for (const topic of allowed) {
    it(`allows authenticated subscription to ${topic}`, async () => {
      const status = await subscribeAndAwait(topic);
      expect(status).toBe("SUBSCRIBED");
    });
  }
});

// ---------------------------------------------------------------------------
// Authenticated clients — impersonation / global topics still denied
// ---------------------------------------------------------------------------
describe("Megatalent voting topics — authenticated user, forbidden scopes", () => {
  beforeEach(() => {
    currentSession = { user: { id: SELF_UID } };
  });

  const denied = [
    // impersonation of another user
    `user:${OTHER_UID}`,
    `user:${OTHER_UID}:megatalent`,
    `user:${OTHER_UID}:megatalent:votes`,
    `user:${OTHER_UID}:megatalent:submission:9`,
    // global / broadcast topics
    "public:megatalent",
    "public:megatalent:votes",
    "megatalent:votes",
    "megatalent:leaderboard",
    "broadcast:megatalent",
    // prefix-spoof attempts (not a true sub-topic of self)
    `user:${SELF_UID}extra`,
    `user:${SELF_UID}extra:megatalent`,
  ];

  for (const topic of denied) {
    it(`rejects authenticated subscription to ${topic}`, async () => {
      const status = await subscribeAndAwait(topic);
      expect(status).toBe("CHANNEL_ERROR");
    });
  }
});

// ---------------------------------------------------------------------------
// Codebase guard — if a developer ever introduces a non-user-scoped Megatalent
// channel, this test fails so the regression cannot ship.
// ---------------------------------------------------------------------------
describe("Codebase guard — Megatalent realtime channels", () => {
  it("src/ contains no global Megatalent channel subscriptions", { timeout: 30_000 }, async () => {
    const { readdir, readFile, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");

    const forbidden = [
      /supabase\.channel\(\s*["'`]public:megatalent[^"'`]*["'`]/i,
      /supabase\.channel\(\s*["'`]megatalent:[^"'`]*["'`]/i,
      /supabase\.channel\(\s*["'`]broadcast:megatalent[^"'`]*["'`]/i,
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
    expect(offenders, `Forbidden Megatalent topics:\n${offenders.join("\n")}`).toEqual([]);
  });
});
