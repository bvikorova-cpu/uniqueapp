import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const useIsAdminMock = vi.fn();
vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => useIsAdminMock(),
}));

import { AdminGuard } from "./AdminGuard";

function renderAt() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <div>ADMIN_PANEL</div>
            </AdminGuard>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminGuard", () => {
  beforeEach(() => useIsAdminMock.mockReset());

  it("shows loader while checking", () => {
    useIsAdminMock.mockReturnValue({ isAdmin: false, loading: true });
    const { container } = renderAt();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders children when admin", () => {
    useIsAdminMock.mockReturnValue({ isAdmin: true, loading: false });
    renderAt();
    expect(screen.getByText("ADMIN_PANEL")).toBeInTheDocument();
  });

  it("redirects non-admins away", async () => {
    useIsAdminMock.mockReturnValue({ isAdmin: false, loading: false });
    renderAt();
    await waitFor(() => expect(screen.getByText("HOME")).toBeInTheDocument());
  });
});
