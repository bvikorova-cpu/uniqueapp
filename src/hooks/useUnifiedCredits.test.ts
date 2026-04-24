import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const getUserMock = vi.fn();
const fromMock = vi.fn();
const safeInvokeMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => getUserMock() },
    from: (t: string) => fromMock(t),
  },
}));
vi.mock("@/utils/safeInvoke", () => ({
  safeInvoke: (...a: any[]) => safeInvokeMock(...a),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { useUnifiedCredits, GLOBAL_CREDIT_PACKAGES } from "./useUnifiedCredits";

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

function mockTable(value: number | null) {
  return {
    select: () => ({
      eq: () => ({
        maybeSingle: () =>
          Promise.resolve({
            data: value === null ? null : { credits_remaining: value },
            error: null,
          }),
      }),
    }),
  };
}

describe("useUnifiedCredits", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    fromMock.mockReset();
    safeInvokeMock.mockReset();
  });

  it("aggregates credits from all credit tables", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const values: Record<string, number> = {
      handwriting_credits: 10,
      past_life_credits: 5,
      anonymous_dating_credits: 0,
      lie_detector_credits: 7,
      creative_forge_credits: 3,
    };
    fromMock.mockImplementation((t: string) => mockTable(values[t] ?? 0));

    const { result } = renderHook(() => useUnifiedCredits(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalCredits).toBe(25);
    expect(result.current.creditBalances?.handwriting).toBe(10);
  });

  it("returns 0 for missing rows", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation(() => mockTable(null));
    const { result } = renderHook(() => useUnifiedCredits(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalCredits).toBe(0);
  });

  it("purchaseCredits returns url on success", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation(() => mockTable(0));
    safeInvokeMock.mockResolvedValue({
      data: { url: "https://stripe/co" },
      error: null,
    });
    const { result } = renderHook(() => useUnifiedCredits(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const url = await result.current.purchaseCredits("handwriting", 30);
    expect(url).toBe("https://stripe/co");
    expect(safeInvokeMock).toHaveBeenCalledWith(
      "create-handwriting-credits-payment",
      { body: { credits: 30 } }
    );
  });

  it("purchaseCredits returns null on error", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    fromMock.mockImplementation(() => mockTable(0));
    safeInvokeMock.mockResolvedValue({ data: null, error: new Error("x") });
    const { result } = renderHook(() => useUnifiedCredits(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const url = await result.current.purchaseCredits("lieDetector", 10);
    expect(url).toBeNull();
  });

  it("exposes well-formed credit packages", () => {
    expect(GLOBAL_CREDIT_PACKAGES.length).toBeGreaterThan(0);
    for (const p of GLOBAL_CREDIT_PACKAGES) {
      expect(p.credits).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThan(0);
    }
  });
});
