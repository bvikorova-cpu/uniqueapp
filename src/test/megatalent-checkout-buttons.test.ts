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

const getSession = supabase.auth.getSession as ReturnType<typeof vi.fn>;
const invoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

// Mirror of handleSubscribe in TalentCommentsSheet.tsx
async function handleSubscribe(tierToBuy: "premium" | "top_premium") {
  try {
    const { data: { session } } = await getSession();
    if (!session) {
      toast({
        title: "Prihlásenie potrebné",
        description: "Pre zakúpenie predplatného sa najprv prihlás.",
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
      throw new Error("Checkout URL nebola vrátená");
    }
  } catch (err: any) {
    toast({
      title: "Chyba pri checkoute",
      description: err?.message || "Nepodarilo sa spustiť platbu.",
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

  it("neprihlásený → zobrazí toast a presmeruje na /auth", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await handleSubscribe("premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Prihlásenie potrebné",
      variant: "destructive",
    }));
    expect(hrefSetter).toHaveBeenCalledWith("/auth?redirect=/megatalent");
    expect(invoke).not.toHaveBeenCalled();
  });

  it("prihlásený Premium → otvorí Stripe URL", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: { url: "https://stripe.test/p" }, error: null });
    await handleSubscribe("premium");
    expect(invoke).toHaveBeenCalledWith("create-megatalent-checkout", {
      body: { tier: "premium" },
      headers: { Authorization: "Bearer tok" },
    });
    expect(open).toHaveBeenCalledWith("https://stripe.test/p", "_blank");
  });

  it("prihlásený TOP Premium → otvorí Stripe URL", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: { url: "https://stripe.test/tp" }, error: null });
    await handleSubscribe("top_premium");
    expect(invoke).toHaveBeenCalledWith("create-megatalent-checkout", expect.objectContaining({
      body: { tier: "top_premium" },
    }));
    expect(open).toHaveBeenCalledWith("https://stripe.test/tp", "_blank");
  });

  it("edge function vráti error → destructive toast", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: null, error: new Error("Stripe key missing") });
    await handleSubscribe("premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Chyba pri checkoute",
      description: "Stripe key missing",
      variant: "destructive",
    }));
    expect(open).not.toHaveBeenCalled();
  });

  it("chýbajúca URL v odpovedi → destructive toast", async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
    invoke.mockResolvedValue({ data: {}, error: null });
    await handleSubscribe("top_premium");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Chyba pri checkoute",
      description: "Checkout URL nebola vrátená",
      variant: "destructive",
    }));
  });
});
