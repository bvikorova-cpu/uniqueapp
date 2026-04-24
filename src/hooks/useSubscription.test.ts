import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const getUserMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => getUserMock() },
    from: (t: string) => fromMock(t),
  },
}));

import { useSubscription } from "./useSubscription";

function rolesTable(role: string | null) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: role ? { role } : null, error: null }),
        }),
      }),
    }),
  };
}
function subsTable(tier: string | null) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: tier ? { tier } : null, error: null }),
            }),
          }),
        }),
      }),
    }),
  };
}
function countTable(count: number) {
  return {
    select: () => ({
      eq: () => ({
        gte: () => Promise.resolve({ count, error: null }),
      }),
    }),
  };
}

describe("useSubscription", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    fromMock.mockReset();
  });

  it("defaults to basic tier when not authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.limits.tier).toBe("basic");
  });

  it("admin role escalates to business tier", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation((t: string) => {
      if (t === "user_roles") return rolesTable("admin");
      return subsTable(null);
    });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.limits.tier).toBe("business");
  });

  it("uses active premium subscription tier", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation((t: string) => {
      if (t === "user_roles") return rolesTable(null);
      return subsTable("premium");
    });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.limits.tier).toBe("premium");
    expect(result.current.calculateCommission(100)).toBe(0);
  });

  it("calculates commission for basic tier (3%)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation((t: string) => {
      if (t === "user_roles") return rolesTable(null);
      return subsTable(null);
    });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.calculateCommission(100)).toBe(3);
  });

  it("canCreateListing respects monthly limit", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    let callCount = 0;
    fromMock.mockImplementation((t: string) => {
      if (t === "user_roles") return rolesTable(null);
      if (t === "subscriptions") return subsTable(null);
      // count call
      callCount++;
      return countTable(callCount === 1 ? 4 : 5);
    });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let allowed = false;
    await act(async () => {
      allowed = await result.current.canCreateListing("bazaar");
    });
    expect(allowed).toBe(true); // 4 < 5
    await act(async () => {
      allowed = await result.current.canCreateListing("bazaar");
    });
    expect(allowed).toBe(false); // 5 not < 5
  });

  it("canCreateListing always true for unlimited tier", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation((t: string) => {
      if (t === "user_roles") return rolesTable("admin");
      return subsTable(null);
    });
    const { result } = renderHook(() => useSubscription());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let allowed = false;
    await act(async () => {
      allowed = await result.current.canCreateListing("auction");
    });
    expect(allowed).toBe(true);
  });
});
