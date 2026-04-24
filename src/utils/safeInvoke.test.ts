import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase client BEFORE importing module under test
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { safeInvoke, invokeOrThrow } from "./safeInvoke";
import { supabase } from "@/integrations/supabase/client";

const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

describe("safeInvoke", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it("returns data on success", async () => {
    mockInvoke.mockResolvedValue({ data: { ok: true }, error: null });
    const result = await safeInvoke("my-fn", { body: { x: 1 } });
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ ok: true });
  });

  it("returns error message when SDK reports error", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error("Boom"),
    });
    const result = await safeInvoke("fn");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Boom");
  });

  it("hides technical non-2xx noise", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error("Edge Function returned a non-2xx status code"),
    });
    const result = await safeInvoke("fn");
    expect(result.error).toMatch(/temporarily unavailable/i);
  });

  it("treats 200 body { error } as failure", async () => {
    mockInvoke.mockResolvedValue({
      data: { error: "Not enough credits" },
      error: null,
    });
    const result = await safeInvoke("fn");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Not enough credits");
  });

  it("catches thrown exceptions", async () => {
    mockInvoke.mockRejectedValue(new Error("Network down"));
    const result = await safeInvoke("fn");
    expect(result.error).toBe("Network down");
  });
});

describe("invokeOrThrow", () => {
  beforeEach(() => mockInvoke.mockReset());

  it("returns data when ok", async () => {
    mockInvoke.mockResolvedValue({ data: { value: 42 }, error: null });
    await expect(invokeOrThrow("fn")).resolves.toEqual({ value: 42 });
  });

  it("throws when error", async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error("Fail") });
    await expect(invokeOrThrow("fn")).rejects.toThrow("Fail");
  });
});
