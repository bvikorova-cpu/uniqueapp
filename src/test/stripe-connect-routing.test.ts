/**
 * Regression: useStripeConnect must route to check-router (not the removed
 * check-connect-status). Verifies both proxyMap.resolveProxy and the
 * global monkey-patch in patchSupabaseFunctions.ts.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveProxy } from "@/integrations/supabase/proxyMap";

describe("check-connect-status routing", () => {
  it("proxyMap resolves check-connect-status → check-router", () => {
    const r = resolveProxy("check-connect-status", {});
    expect(r).not.toBeNull();
    expect(r!.target).toBe("check-router");
    expect(r!.body.action).toBe("connect_status");
  });

  it("proxyMap preserves caller-supplied action (live_status / connect_login)", () => {
    for (const action of ["live_status", "connect_login", "customer_portal"]) {
      const r = resolveProxy("check-connect-status", { action });
      expect(r!.target).toBe("check-router");
      expect(r!.body.action).toBe(action);
    }
  });
});

describe("patchSupabaseFunctions rewrites check-connect-status", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("invoke('check-connect-status') calls check-router with connect_status", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    vi.doMock("@/integrations/supabase/client", () => ({
      supabase: { functions: { invoke } },
    }));

    await import("@/utils/patchSupabaseFunctions");
    const { supabase } = await import("@/integrations/supabase/client");

    await supabase.functions.invoke("check-connect-status");
    await supabase.functions.invoke("check-connect-status", { body: { action: "connect_login" } });
    await supabase.functions.invoke("check-connect-status", { body: { action: "live_status" } });

    expect(invoke).toHaveBeenNthCalledWith(1, "check-router", expect.objectContaining({
      body: expect.objectContaining({ action: "connect_status", _aliasFrom: "check-connect-status" }),
    }));
    expect(invoke).toHaveBeenNthCalledWith(2, "check-router", expect.objectContaining({
      body: expect.objectContaining({ action: "connect_login" }),
    }));
    expect(invoke).toHaveBeenNthCalledWith(3, "check-router", expect.objectContaining({
      body: expect.objectContaining({ action: "live_status" }),
    }));
  });
});
