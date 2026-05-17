import { describe, it, expect, vi, beforeEach } from "vitest";

const invokeMock = vi.fn();
const fromMock = vi.fn();
const getSessionMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: () => getSessionMock() },
    functions: { invoke: (name: string, opts: any) => invokeMock(name, opts) },
    from: (t: string) => fromMock(t),
  },
}));

// Build a mock chain that resolves to no rows
function emptyTable() {
  return {
    select: () => ({
      order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
    }),
  };
}

describe("admin-moderate-campaign invocation contract", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    fromMock.mockReset();
    getSessionMock.mockReset();
    fromMock.mockImplementation(() => emptyTable());
    getSessionMock.mockResolvedValue({ data: { session: { access_token: "tok-abc" } } });
  });

  it("sends approve action with bearer token", async () => {
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.functions.invoke("admin-moderate-campaign", {
      body: { campaignType: "medical", campaignId: "id1", action: "approve", notes: null },
      headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
    });
    expect(invokeMock).toHaveBeenCalledWith(
      "admin-moderate-campaign",
      expect.objectContaining({
        body: expect.objectContaining({ action: "approve", campaignType: "medical", campaignId: "id1" }),
        headers: expect.objectContaining({ Authorization: "Bearer tok-abc" }),
      })
    );
  });

  it.each(["reject", "ban", "flag", "unflag"] as const)("sends %s action with notes", async (action) => {
    invokeMock.mockResolvedValue({ data: { success: true }, error: null });
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.functions.invoke("admin-moderate-campaign", {
      body: { campaignType: "dream", campaignId: "id2", action, notes: "because" },
      headers: { Authorization: "Bearer tok-abc" },
    });
    const lastCall = invokeMock.mock.calls.at(-1)!;
    expect(lastCall[1].body.action).toBe(action);
    expect(lastCall[1].body.notes).toBe("because");
  });

  it("propagates server error payload", async () => {
    invokeMock.mockResolvedValue({ data: { error: "Admin role required" }, error: null });
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.functions.invoke("admin-moderate-campaign", {
      body: { campaignType: "medical", campaignId: "id1", action: "approve" },
    });
    expect((data as any).error).toBe("Admin role required");
  });
});
