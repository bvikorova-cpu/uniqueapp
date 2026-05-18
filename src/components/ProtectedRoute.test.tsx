import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const useAuthMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (t: string) => fromMock(t) },
}));

import { ProtectedRoute } from "./ProtectedRoute";

function roleRow(found: boolean) {
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

function renderApp(node: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/secret" element={node} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    fromMock.mockReset();
  });

  it("redirects to / when not authenticated", async () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    renderApp(<ProtectedRoute><div>SECRET</div></ProtectedRoute>);
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
  });

  it("renders children when authenticated (no admin required)", async () => {
    useAuthMock.mockReturnValue({ user: { id: "u1" }, loading: false });
    renderApp(<ProtectedRoute><div>SECRET</div></ProtectedRoute>);
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });

  it("redirects authed non-admin away from admin-only route", async () => {
    useAuthMock.mockReturnValue({ user: { id: "u1" }, loading: false });
    fromMock.mockImplementation(() => roleRow(false));
    renderApp(<ProtectedRoute requireAdmin><div>SECRET</div></ProtectedRoute>);
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
  });

  it("allows admin into admin-only route", async () => {
    useAuthMock.mockReturnValue({ user: { id: "u1" }, loading: false });
    fromMock.mockImplementation(() => roleRow(true));
    renderApp(<ProtectedRoute requireAdmin><div>SECRET</div></ProtectedRoute>);
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });

  it("checks role on user_roles table (no privilege escalation via profiles)", async () => {
    useAuthMock.mockReturnValue({ user: { id: "u1" }, loading: false });
    fromMock.mockImplementation(() => roleRow(false));
    renderApp(<ProtectedRoute requireAdmin><div>SECRET</div></ProtectedRoute>);
    await waitFor(() => expect(fromMock).toHaveBeenCalled());
    expect(fromMock).toHaveBeenCalledWith("user_roles");
  });
});
