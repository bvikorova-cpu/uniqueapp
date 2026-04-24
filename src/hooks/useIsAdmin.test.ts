import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const getSessionMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: () => getSessionMock() },
    from: (t: string) => fromMock(t),
  },
}));

import { useIsAdmin } from "./useIsAdmin";

function rolesTable(found: boolean) {
  return {
    select: () => ({
      eq: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: found ? { role: "admin" } : null, error: null }),
        }),
      }),
    }),
  };
}

describe("useIsAdmin", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    fromMock.mockReset();
  });

  it("returns false when no session", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns true when admin role exists", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    fromMock.mockImplementation(() => rolesTable(true));
    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns false when no admin role", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    fromMock.mockImplementation(() => rolesTable(false));
    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("queries user_roles, not profiles (no privilege escalation)", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    fromMock.mockImplementation(() => rolesTable(false));
    renderHook(() => useIsAdmin());
    await waitFor(() => expect(fromMock).toHaveBeenCalled());
    expect(fromMock).toHaveBeenCalledWith("user_roles");
  });
});
