import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

// Mocks
const onAuthChangeMock = vi.fn();
const getSessionMock = vi.fn();
const signUpMock = vi.fn();
const signInMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: any) => {
        onAuthChangeMock(cb);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      getSession: () => getSessionMock(),
      signUp: (...args: any[]) => signUpMock(...args),
      signInWithPassword: (...args: any[]) => signInMock(...args),
      signOut: () => signOutMock(),
    },
  },
}));

import { AuthProvider, useAuth } from "./AuthContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe("AuthContext", () => {
  beforeEach(() => {
    onAuthChangeMock.mockClear();
    getSessionMock.mockReset();
    signUpMock.mockReset();
    signInMock.mockReset();
    signOutMock.mockReset();
  });

  it("starts with loading=true and resolves with no session", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("hydrates from existing session", async () => {
    const session = { user: { id: "u-1", email: "a@b.c" } };
    getSessionMock.mockResolvedValue({ data: { session } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe("u-1"));
  });

  it("signIn delegates to supabase and returns error shape", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    signInMock.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: any;
    await act(async () => {
      res = await result.current.signIn("a@b.c", "pw");
    });
    expect(signInMock).toHaveBeenCalledWith({ email: "a@b.c", password: "pw" });
    expect(res.error).toBeNull();
  });

  it("signUp passes redirect + metadata", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    signUpMock.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp("e@x.com", "pw", "Eve");
    });
    const args = signUpMock.mock.calls[0][0];
    expect(args.email).toBe("e@x.com");
    expect(args.options.data.full_name).toBe("Eve");
    expect(args.options.emailRedirectTo).toContain("/");
  });

  it("signOut calls supabase signOut", async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    signOutMock.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });
    expect(signOutMock).toHaveBeenCalled();
  });

  it("throws if useAuth used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth must be used within an AuthProvider/
    );
    spy.mockRestore();
  });
});
