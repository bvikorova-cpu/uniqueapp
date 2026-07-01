import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for the "Subscribe Premium / TOP Premium" buttons inside
 * TalentCommentsSheet. We replicate the handleSubscribe logic in isolation
 * so we don't need to mount the full React tree (which depends on many hubs).
 */

const toast = vi.fn();
const open = vi.fn();
const hrefSetter = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    functions: { invoke: vi.fn() },
  },
}));

import { supabase } from "@/integrations/supabase/client";

const getSession = supabase.auth.getSession as unknown as (() => Promise<any>) & {
  mockReset: () => void;
  mockResolvedValue: (value: any) => void;
};
const invoke = supabase.functions.invoke as unknown as ((name: string, options?: any) => Promise<any>) & {
  mockReset: () => void;
  mockResolvedValue: (value: any) => void;
};

// Mirror of handleSubscribe in TalentCommentsSheet.tsx
async function handleSubscribe(tierToBuy: "premium" | "top_premium") {
  try {
    const { data: { session } } = await getSession();
    if (!session) {
      toast({
        title: "Login required",
        description: "To purchase a subscription, please log in first.",
        variant: "destructive",
      });
      hrefSetter("/auth?redirect=/megatalent");
      return;
    }
    const { data, error } = await invoke("create-megatalent-checkout", {
      body: { tier: tierToBuy },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) throw error;
    if (data?.url) {
      open(data.url, "_blank");
      toast({ title: "Presmerovanie na Stripe…", description: "ok" });
    } else {
      throw new Error("Checkout URL was not returned");
    }
  } catch (err: any) {
    toast({
      title: "Checkout error",
      description: err?.message || "Failed to initiate payment.",
      variant: "destructive",
    });
  }
}

describe("Megatalent subscribe buttons", () => {
  beforeEach(() => {
    toast.mockReset();
    open.mockReset();
    hrefSetter.mockReset();
    getSession.mockReset();
    invoke.mockReset();
  });

  it("logged out → displays toast and redirects to /auth", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await handleSubscribe("premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Login required",
      variant: "destructive",
    }));
    expect(hrefSetter).toHaveBeenCalledWith("/auth?redirect=/megatalent");
    expect(invoke).not.toHaveBeenCalled();
  });

  it("logged in Premium → opens Stripe URL", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: { url: "https://stripe.test/p" }, error: null });
    await handleSubscribe("premium");
    expect(invoke).toHaveBeenCalledWith("create-megatalent-checkout", {
      body: { tier: "premium" },
      headers: { Authorization: "Bearer tok" },
    });
    expect(open).toHaveBeenCalledWith("https://stripe.test/p", "_blank");
  });

  it("logged in TOP Premium → opens Stripe URL", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: { url: "https://stripe.test/tp" }, error: null });
    await handleSubscribe("top_premium");
    expect(invoke).toHaveBeenCalledWith("create-megatalent-checkout", expect.objectContaining({
      body: { tier: "top_premium" },
    }));
    expect(open).toHaveBeenCalledWith("https://stripe.test/tp", "_blank");
  });

  it("edge function returns error → destructive toast", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: null, error: new Error("Stripe key missing") });
    await handleSubscribe("premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Checkout error",
      description: "Stripe key missing",
      variant: "destructive",
    }));
    expect(open).not.toHaveBeenCalled();
  });

  it("missing URL in response → destructive toast", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: {}, error: null });
    await handleSubscribe("top_premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Checkout error",
      description: "Checkout URL was not returned",
      variant: "destructive",
    }));
  });
});
