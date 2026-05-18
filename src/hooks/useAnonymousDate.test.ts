import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => getUserMock() },
    from: (t: string) => fromMock(t),
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { useAnonymousDate } from "./useAnonymousDate";

const ME = "me-user-id";
const PARTNER_A = "partner-a";
const PARTNER_B = "partner-b";

const profileA = {
  user_id: PARTNER_A,
  anonymous_name: "Mystic Fox",
  age_range: "25-30",
  interests: ["yoga", "books"],
  personality_traits: ["calm"],
};
const profileB = {
  user_id: PARTNER_B,
  anonymous_name: "Silver Wolf",
  age_range: "30-35",
  interests: ["hiking", "music", "art"],
  personality_traits: ["bold"],
};

const matchA = {
  id: "match-a",
  user1_id: ME,
  user2_id: PARTNER_A,
  status: "active",
  expires_at: new Date(Date.now() + 5 * 86400000).toISOString(),
};
const matchB = {
  id: "match-b",
  user1_id: PARTNER_B, // I am user2 here
  user2_id: ME,
  status: "revealed",
  expires_at: null,
  revealed_at: new Date().toISOString(),
};

/** Build a mock implementation of supabase.from() that handles all
 * tables touched by useAnonymousDate's initial mount. */
function buildFromMock(opts: {
  matches?: any[];
  profiles?: any[];
  credits?: { credits_remaining: number } | null;
}) {
  const matches = opts.matches ?? [];
  const profiles = opts.profiles ?? [];
  const credits = opts.credits === undefined ? { credits_remaining: 0 } : opts.credits;

  return (table: string) => {
    if (table === "anonymous_dating_credits") {
      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: credits,
                error: credits ? null : { code: "PGRST116" },
              }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { credits_remaining: 0 },
                error: null,
              }),
          }),
        }),
      };
    }

    if (table === "anonymous_dating_matches") {
      return {
        select: () => ({
          or: () => ({
            in: () => ({
              order: () => Promise.resolve({ data: matches, error: null }),
            }),
          }),
        }),
      };
    }

    if (table === "blocked_users") {
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }

    if (table === "anonymous_dating_profiles") {
      return {
        select: () => ({
          in: (_col: string, ids: string[]) =>
            Promise.resolve({
              data: profiles.filter((p) => ids.includes(p.user_id)),
              error: null,
            }),
        }),
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  };
}

describe("useAnonymousDate — partner profile enrichment (RLS-dependent UX)", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    fromMock.mockReset();
    getUserMock.mockResolvedValue({ data: { user: { id: ME } } });
  });

  it("enriches each match with the correct partner profile (different partners)", async () => {
    fromMock.mockImplementation(
      buildFromMock({
        matches: [matchA, matchB],
        profiles: [profileA, profileB],
      })
    );

    const { result } = renderHook(() => useAnonymousDate());

    await waitFor(() => expect(result.current.activeMatches.length).toBe(2));

    const a = result.current.activeMatches.find((m) => m.id === "match-a");
    const b = result.current.activeMatches.find((m) => m.id === "match-b");

    expect(a?.partner_profile?.anonymous_name).toBe("Mystic Fox");
    expect(a?.partner_profile?.age_range).toBe("25-30");
    expect(a?.partner_profile?.interests).toEqual(["yoga", "books"]);

    // Match B: I am user2, partner is user1 — partner-resolution must invert.
    expect(b?.partner_profile?.anonymous_name).toBe("Silver Wolf");
    expect(b?.partner_profile?.age_range).toBe("30-35");
    expect(b?.partner_profile?.interests).toEqual(["hiking", "music", "art"]);
  });

  it("falls back to null partner_profile when partner profile row is missing (e.g. RLS hides it)", async () => {
    fromMock.mockImplementation(
      buildFromMock({
        matches: [matchA],
        profiles: [], // simulate RLS blocking partner profile
      })
    );

    const { result } = renderHook(() => useAnonymousDate());
    await waitFor(() => expect(result.current.activeMatches.length).toBe(1));

    expect(result.current.activeMatches[0].partner_profile).toBeNull();
  });

  it("re-fetches matches and partner profiles on remount (page refresh scenario)", async () => {
    fromMock.mockImplementation(
      buildFromMock({ matches: [matchA], profiles: [profileA] })
    );

    const first = renderHook(() => useAnonymousDate());
    await waitFor(() =>
      expect(first.result.current.activeMatches[0]?.partner_profile?.anonymous_name).toBe(
        "Mystic Fox"
      )
    );

    // Simulate a refresh: same hook mounts again, server now returns updated data
    // (e.g. partner changed their anonymous name + a brand-new match appeared).
    const updatedProfileA = { ...profileA, anonymous_name: "Mystic Fox v2" };
    fromMock.mockImplementation(
      buildFromMock({
        matches: [matchA, matchB],
        profiles: [updatedProfileA, profileB],
      })
    );

    const second = renderHook(() => useAnonymousDate());
    await waitFor(() => expect(second.result.current.activeMatches.length).toBe(2));

    const a = second.result.current.activeMatches.find((m) => m.id === "match-a");
    const b = second.result.current.activeMatches.find((m) => m.id === "match-b");
    expect(a?.partner_profile?.anonymous_name).toBe("Mystic Fox v2");
    expect(b?.partner_profile?.anonymous_name).toBe("Silver Wolf");
  });

  it("does not query anonymous_dating_profiles when there are no matches", async () => {
    fromMock.mockImplementation(buildFromMock({ matches: [], profiles: [] }));

    const { result } = renderHook(() => useAnonymousDate());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.activeMatches).toEqual([]);
    expect(fromMock).not.toHaveBeenCalledWith("anonymous_dating_profiles");
  });

  it("queries anonymous_dating_profiles (not profiles) — partner data lives in dating-specific table", async () => {
    fromMock.mockImplementation(
      buildFromMock({ matches: [matchA], profiles: [profileA] })
    );

    renderHook(() => useAnonymousDate());
    await waitFor(() =>
      expect(fromMock).toHaveBeenCalledWith("anonymous_dating_profiles")
    );
    expect(fromMock).not.toHaveBeenCalledWith("profiles");
  });
});
