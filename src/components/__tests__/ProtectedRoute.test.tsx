/**
 * Component test: ProtectedRoute
 *
 * Verifies the route guard:
 *  1. Shows spinner while auth is loading.
 *  2. Redirects to "/" when no user is logged in.
 *  3. Renders children for authenticated user when admin is not required.
 *  4. Redirects when requireAdmin=true but the user has no admin row.
 *  5. Renders children when requireAdmin=true and admin row exists.
 *  6. SMOKE_TEST bypass: window.__SMOKE_TEST__ skips the check entirely.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockAuth = vi.hoisted(() => ({
  user: null as null | { id: string },
  loading: false,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockRoleQuery = vi.hoisted(() => ({
  result: { data: null as { role: string } | null, error: null as any },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => mockRoleQuery.result,
          }),
        }),
      }),
    }),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────
function renderGuard(opts: { admin?: boolean } = {}) {
  return render(
    <MemoryRouter initialEntries={["/secure"]}>
      <Routes>
        <Route
          path="/secure"
          element={
            <ProtectedRoute requireAdmin={opts.admin}>
              <div>SECRET</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/auth" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockAuth.user = null;
  mockAuth.loading = false;
  mockRoleQuery.result = { data: null, error: null };
  (window as any).__SMOKE_TEST__ = false;
});

// ── Tests ─────────────────────────────────────────────────────────────────
describe("ProtectedRoute", () => {
  it("shows spinner while auth is loading", () => {
    mockAuth.loading = true;
    const { container } = renderGuard();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(screen.queryByText("SECRET")).toBeNull();
  });

  it("redirects to / when not logged in", async () => {
    mockAuth.user = null;
    renderGuard();
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
    expect(screen.queryByText("SECRET")).toBeNull();
  });

  it("renders children for logged-in user (no admin required)", async () => {
    mockAuth.user = { id: "u1" };
    renderGuard();
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });

  it("redirects when requireAdmin=true and user has no admin role", async () => {
    mockAuth.user = { id: "u1" };
    mockRoleQuery.result = { data: null, error: null };
    renderGuard({ admin: true });
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
    expect(screen.queryByText("SECRET")).toBeNull();
  });

  it("renders children when admin row exists", async () => {
    mockAuth.user = { id: "u1" };
    mockRoleQuery.result = { data: { role: "admin" }, error: null };
    renderGuard({ admin: true });
    await waitFor(() => expect(screen.getByText("SECRET")).toBeInTheDocument());
  });

  it("redirects when admin role query errors out (fail-closed)", async () => {
    mockAuth.user = { id: "u1" };
    mockRoleQuery.result = { data: null, error: { message: "boom" } };
    renderGuard({ admin: true });
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
  });

  it("SMOKE_TEST bypass: renders children immediately without auth", () => {
    (window as any).__SMOKE_TEST__ = true;
    mockAuth.user = null;
    renderGuard({ admin: true });
    // No spinner, no redirect — children render synchronously.
    expect(screen.getByText("SECRET")).toBeInTheDocument();
  });
});
