import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const useAuthMock = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

import ProfileRedirect from "./ProfileRedirect";

function renderAt() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Routes>
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="/auth" element={<div>AUTH_PAGE</div>} />
        <Route path="/profile/:id" element={<div>PROFILE_PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProfileRedirect", () => {
  it("redirects unauthenticated to /auth", () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    renderAt();
    expect(screen.getByText("AUTH_PAGE")).toBeInTheDocument();
  });

  it("redirects authenticated to /profile/:id", () => {
    useAuthMock.mockReturnValue({ user: { id: "abc-123" }, loading: false });
    renderAt();
    expect(screen.getByText("PROFILE_PAGE")).toBeInTheDocument();
  });

  it("shows loader while auth still loading", () => {
    useAuthMock.mockReturnValue({ user: null, loading: true });
    const { container } = renderAt();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
});
