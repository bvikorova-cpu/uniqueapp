import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import NotFound from "./NotFound";

// Silence console noise from NotFound
beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/subscription" element={<div>SUB_PAGE</div>} />
        <Route path="/premium" element={<div>PREMIUM_PAGE</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NotFound legacy redirects", () => {
  it.each([
    ["/pricing", "SUB_PAGE"],
    ["/Plans", "SUB_PAGE"],
    ["/billing/invoice/123", "SUB_PAGE"],
    ["/checkout/", "SUB_PAGE"],
    ["/vip", "PREMIUM_PAGE"],
    ["/pro/anything", "PREMIUM_PAGE"],
  ])("redirects %s to canonical page", (path, expected) => {
    renderAt(path);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("shows 404 fallback UI for truly unknown route", () => {
    renderAt("/totally-random-xyz");
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to home/i })).toHaveAttribute("href", "/");
  });
});
